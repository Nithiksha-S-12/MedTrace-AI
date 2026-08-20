import Link from "next/link";
import { User, Stethoscope, Building2 } from "lucide-react";

export default function RegisterRoleSelection() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select your role to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-4">
          <Link href="/auth/register/citizen" className="flex items-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <User className="h-8 w-8 text-blue-600 group-hover:text-blue-700 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-700">Citizen</h3>
              <p className="text-sm text-gray-500">Register as a patient</p>
            </div>
          </Link>

          <Link href="/auth/register/doctor" className="flex items-center p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
            <Stethoscope className="h-8 w-8 text-green-600 group-hover:text-green-700 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-700">Doctor</h3>
              <p className="text-sm text-gray-500">Register as a medical professional</p>
            </div>
          </Link>

          <Link href="/auth/register/scan-centre" className="flex items-center p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
            <Building2 className="h-8 w-8 text-purple-600 group-hover:text-purple-700 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-700">Scan Centre</h3>
              <p className="text-sm text-gray-500">Register a diagnostic facility</p>
            </div>
          </Link>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
