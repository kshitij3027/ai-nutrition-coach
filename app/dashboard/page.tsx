import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SyncProfile } from "@/components/auth/sync-profile";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <SyncProfile />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hello World - You are authenticated!
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Information</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">User ID:</span> {userId}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {user?.emailAddresses[0]?.emailAddress || "No email"}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {user?.firstName} {user?.lastName || ""}
            </p>
          </div>
        </div>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
