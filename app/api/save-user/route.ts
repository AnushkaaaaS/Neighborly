import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";
import { ServiceType } from "@prisma/client";


// Define valid enum values (must match Prisma schema)
const validServiceTypes = Object.values(ServiceType);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,            // Supabase UID
      email,
      name,
      location,
      is_provider,
      service_type,
      experience,
      bio,
    } = body;

    // ✅ Step 1: Create user
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        location,
        role: is_provider ? "PROVIDER" : "CUSTOMER",
      },
    });

    // ✅ Step 2: If provider, create provider profile
    if (is_provider) {
      const normalizedServiceType = typeof service_type === "string"
        ? service_type.trim().toUpperCase()
        : null;

      if (!normalizedServiceType || !validServiceTypes.includes(normalizedServiceType)) {
        return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
      }

 await prisma.providerProfile.create({
  data: {
    userId: id,
    serviceTypes: [normalizedServiceType],
    experience: experience ? parseInt(experience) : undefined,
    bio: bio || "",
  },
});

    }

    return NextResponse.json({ message: "User saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Save user failed:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
