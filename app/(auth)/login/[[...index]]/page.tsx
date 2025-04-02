import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center mt-20">
      <SignIn appearance={{ variables: { colorPrimary: '#2563eb' } }} />
    </div>
  );
}