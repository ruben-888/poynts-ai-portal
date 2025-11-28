import Image from "next/image";

interface NoAccessProps {
  message?: string;
}

export function NoAccess({
  message = "Sorry, you are not allowed here.",
}: NoAccessProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-20 p-4">
      <Image
        src="/img/carebot/carebot-stop.png"
        alt="Access Denied"
        width={200}
        height={200}
        priority
      />
      <p className="mt-4 text-lg text-center text-gray-700 font-bold">
        {message}
      </p>
    </div>
  );
}
