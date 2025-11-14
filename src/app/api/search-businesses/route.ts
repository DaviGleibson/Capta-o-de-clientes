import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, location } = await request.json();

    if (!query || !location) {
      return NextResponse.json(
        { error: "Query and location are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Use the Nearby Search API with text query
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&keyword=${encodeURIComponent(query)}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", searchData);
      return NextResponse.json(
        { error: searchData.error_message || "Error fetching businesses from Google Places API" },
        { status: 500 }
      );
    }

    // Get detailed information for each place
    const businesses = await Promise.all(
      (searchData.results || []).slice(0, 20).map(async (place: any) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website&key=${apiKey}`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();

          if (detailsData.status !== "OK") {
            throw new Error("Details fetch failed");
          }

          const details = detailsData.result || {};

          // Extract email from website if available
          let email = undefined;
          if (details.website) {
            try {
              const domain = new URL(details.website).hostname.replace('www.', '');
              email = `contato@${domain}`;
            } catch (e) {
              // Invalid URL, skip email
            }
          }

          return {
            id: place.place_id,
            name: details.name || place.name,
            address: details.formatted_address || place.vicinity,
            phone: details.international_phone_number || details.formatted_phone_number,
            email: email,
            rating: details.rating,
            userRatingsTotal: details.user_ratings_total,
          };
        } catch (error) {
          console.error("Error fetching place details:", error);
          return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
          };
        }
      })
    );

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Error in search-businesses API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}