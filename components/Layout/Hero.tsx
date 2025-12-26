'use client';
import React from 'react';
import Image from 'next/image';
import Hero from "@/assets/object.svg";
import { useRouter } from "next/navigation";

const HomePage: React.FC = () => {
  const router = useRouter()
  const getStarted = (): void => {
    router.push("/signup");
  };

  return (
    <>
      {/* hero - start */}
      <div className="bg-white px-4 sm:px-6 md:px-8">

        <div className="mx-auto max-w-7xl pt-20 md:pt-28 md:pb-14 lg:pt-32 lg:pb-20">
          <section className="flex max-md:flex-col  items-center justify-between gap-2 ">

            <div className="flex flex-col justify-center w-full lg:w-1/2 text-left ">
              <h1 className="text-3xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-6xl font-bold text-gray-900 leading-tight sm:leading-tight md:leading-tight lg:leading-tight tracking-tight mb-4 sm:mb-6 ">
                Split Smarter,
                <br className="" />
                Spend Together
              </h1>
              
              <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl text-gray-600 leading-relaxed tracking-wide mb-6 sm:mb-8 md:mb-10 lg:mb-12 max-w-full md:max-w-md lg:max-w-lg mx-auto lg:mx-0">
                CoSplitz helps you share expenses, organize group payments, and buy things together — whether you're a seller or just need people to split costs with.
              </p>

              {/* Desktop Buttons */}
              <div className="hidden md:flex flex-col sm:flex-row gap-3 lg:gap-4 w-full max-w-md ">
                <button
                  onClick={getStarted}
                  className="px-6 sm:px-8 md:px-10 lg:px-12 py-3  bg-[#1F8225] text-white text-base sm:text-lg lg:text-xl font-semibold rounded-lg shadow-lg hover:bg-[#17661C] hover:shadow-xl active:scale-95 transition-all duration-300 flex-1 sm:flex-none"
                >
                  Get Started
                </button>
                <button className="px-6 sm:px-8 md:px-10 lg:px-12 py-3  border-2 border-[#1F8225] text-[#1F8225] text-base sm:text-lg lg:text-xl font-semibold rounded-lg hover:bg-[#f0f9f0] hover:border-[#17661C] active:scale-95 transition-all duration-300 flex-1 sm:flex-none">
                  Learn More
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center items-end lg:mb-0">
            <div className="relative w-full flex justify-between  max-w-sm py-2 lg:max-w-xl">
                <Image
                src={Hero}
                alt="App illustration"
                className="w-full h-auto object-contain drop-shadow-2xl"
                draggable="false"
                priority
                />
            </div>
            </div>


          </section>
        </div>

        {/* Mobile Buttons - positioned below content */}
        <div className="md:hidden  mt-4">
          <div className="flex flex-col gap-3 sm:gap-4 w-full  mx-auto">
            <button
              onClick={getStarted}
              className="px-6 py-3.5 sm:py-4 bg-[#1F8225] text-white text-lg sm:text-xl font-semibold rounded-lg shadow-lg hover:bg-[#17661C] hover:shadow-xl active:scale-95 transition-all duration-300 w-full"
            >
              Get Started
            </button>
            <button className="px-6 py-3.5 sm:py-4 border-2 border-[#1F8225] text-[#1F8225] text-lg sm:text-xl font-semibold rounded-lg hover:bg-[#f0f9f0] hover:border-[#17661C] active:scale-95 transition-all duration-300 w-full">
              Learn More
            </button>
          </div>
        </div>
      </div>
      {/* hero - end */}
    </>
  );
};

export default HomePage;