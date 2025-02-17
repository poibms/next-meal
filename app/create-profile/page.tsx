'use client'
import React, {useEffect} from 'react';
import {useMutation} from "@tanstack/react-query";
import {useUser} from "@clerk/nextjs";
import {useRouter} from "next/navigation";

type ApiResponse = {
  message: string;
  error?: string;
}

async function createProfileRequest() {
  const response = await fetch('/api/create-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const data = await response.json()
  return data as ApiResponse;
}

const ProfilePage = () => {
  const {isLoaded, isSignedIn} = useUser();
  const router = useRouter();
  const {mutate, isPending} = useMutation<ApiResponse, Error>({
    mutationFn: createProfileRequest,
    onSuccess: () => {
      router.push('/subscribe')
    },
    onError: (error) => {
      console.log(error)
    }
  })

  useEffect(() => {
    if(isLoaded && isSignedIn && !isPending) {
      mutate()
    }
  }, [isLoaded, isPending, isSignedIn]);

  return (
    <div>
      Processing sign in...
    </div>
  );
};

export default ProfilePage;