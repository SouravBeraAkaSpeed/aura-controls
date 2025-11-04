import { useGoogleLogin } from "@react-oauth/google";

export const CustomGoogleButton = ({ onSuccess, onError,showGoogleLogin }: any) => {
  const login = useGoogleLogin({
    onSuccess,
    onError,
  });

  return (
    <button
      onClick={() => login()}
      className="flex w-full items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 shadow hover:bg-gray-50"
    >
      <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" className="h-5 w-5" />
      <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
    </button>
  );
};
