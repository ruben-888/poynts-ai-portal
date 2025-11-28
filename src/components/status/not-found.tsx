import Image from "next/image";

interface NotFoundProps {
  message?: string;
}

export function NotFound({
  message = "Sorry, we couldn't find what you're looking for.",
}: NotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-20 p-4">
      <Image
        src="/img/carebot/carebot-sad.png"
        alt="Not Found"
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
