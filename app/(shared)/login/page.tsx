// app/login/page.tsx
import LoginForm from "./login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";
import ImageSlider from "@/components/ImageSlider";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    const role = session.user.role;
    if (role === "ADMIN") redirect("/admin");
    if (role === "TEACHER") redirect("/teacher/dashboard");
    if (role === "STUDENT") redirect("/student/dashboard");
  }

  // Array of background images
  const backgroundImages = [
    "/images/hostel.jpg",
    "/images/cultureandshopping.jpg",
    "/images/paris.jpg",
    "/images/arrivalinparis.jpg",
    "/images/learning.jpg"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content Section */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden">
        {/* Background Image Slider with Overlay */}
        <ImageSlider images={backgroundImages} />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72  rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>

        {/* Login Form Container */}
        <div className="relative z-10 w-full max-w-md p-1">
          <div className="absolute inset-0  rounded-2xl blur-md opacity-75"></div>
          <div className="relative bg-gray-900/90  rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            {/* Form Header */}
            <div className="p-8 pb-6 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <Image 
                  src="/images/NH.png"
                  height={50}
                  width={50}
                  alt="logo"
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-300">Sign in to access your account</p>
            </div>

            {/* Form Content */}
            <div className="px-8 pb-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="relative z-10 bg-gray-900 border-t border-white/10">
        <Footer />
      </div>
    </div>
  );
}