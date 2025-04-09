'use client';

import DxButton from '@/components/danielxie/dxButton';

export default function TestDxButtonPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-4xl mx-auto bg-[#2a2a2a] rounded-xl p-8 shadow-md text-[#d1cfbf]">
        <h1 className="text-2xl font-bold mb-6 font-vastago">DxButton Component Test</h1>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 font-vastago">Default Button</h2>
          <div className="flex flex-wrap gap-4">
            <DxButton>Get Started</DxButton>
            <DxButton destination="/select">Get Started with Navigation</DxButton>
          </div>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 font-vastago">Color Variants</h2>
          <div className="flex flex-wrap gap-4">
            <DxButton bgColor="bg-blue-500" textColor="text-white" hoverColor="hover:bg-blue-600">
              Blue Button
            </DxButton>
            
            <DxButton bgColor="bg-green-500" textColor="text-white" hoverColor="hover:bg-green-600">
              Green Button
            </DxButton>
            
            <DxButton bgColor="bg-red-500" textColor="text-white" hoverColor="hover:bg-red-600">
              Red Button
            </DxButton>
            
            <DxButton bgColor="bg-[#d1cfbf]" textColor="text-[#1a1a1a]" hoverColor="hover:bg-[#c1bfaf]">
              Light Variant
            </DxButton>
          </div>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 font-vastago">Shape Variants</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <DxButton rounded="rounded-none">Square</DxButton>
            <DxButton rounded="rounded-md">Rounded Medium</DxButton>
            <DxButton rounded="rounded-lg">Rounded LG</DxButton>
            <DxButton rounded="rounded-full">Rounded Full</DxButton>
          </div>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 font-vastago">Size Variants (via Padding)</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <DxButton padding="px-3 py-1" className="text-sm">Small</DxButton>
            <DxButton padding="px-6 py-2.5">Medium (Default)</DxButton>
            <DxButton padding="px-10 py-3" className="text-lg">Large</DxButton>
          </div>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 font-vastago">Border & Shadow</h2>
          <div className="flex flex-wrap gap-4">
            <DxButton border="border border-gray-300">With Border</DxButton>
            <DxButton shadow="shadow-md">With Shadow</DxButton>
            <DxButton border="border-2 border-blue-500" shadow="shadow-lg">Border & Shadow</DxButton>
          </div>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 font-vastago">States</h2>
          <div className="flex flex-wrap gap-4">
            <DxButton disabled>Disabled Button</DxButton>
            <DxButton
              onClick={() => alert('Button clicked!')}
              bgColor="bg-blue-500"
              textColor="text-white"
              hoverColor="hover:bg-blue-600"
            >
              Click Me
            </DxButton>
          </div>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 font-vastago">Full Width</h2>
          <div className="w-full space-y-4">
            <DxButton fullWidth>Full Width Button</DxButton>
            <DxButton
              fullWidth
              bgColor="bg-indigo-500"
              textColor="text-white"
              hoverColor="hover:bg-indigo-600"
            >
              Full Width Colored Button
            </DxButton>
          </div>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 font-vastago">Combined Custom Example</h2>
          <div className="flex flex-wrap gap-4">
            <DxButton
              bgColor="bg-gradient-to-r from-purple-500 to-pink-500"
              textColor="text-white"
              rounded="rounded-full"
              padding="px-8 py-3"
              shadow="shadow-lg"
              className="font-bold"
              hoverColor="hover:from-purple-600 hover:to-pink-600"
            >
              Custom Gradient Button
            </DxButton>
          </div>
        </section>
      </div>
    </div>
  );
} 