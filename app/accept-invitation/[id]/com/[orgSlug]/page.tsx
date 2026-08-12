import { auth } from "@/lib/auth";
import { Param } from "@prisma/client/runtime/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const page = async ({params}: {params: Promise<{ orgSlug: string, id: string }>}) => {
  const {id, orgSlug } = await params
  
  const data = await auth.api.acceptInvitation({
      body: {
        invitationId:id, // required
      },
      // This endpoint requires session cookies.
      headers: await headers(),
  });

  redirect(`/dashboard/com/${orgSlug}`)
}

export default page
