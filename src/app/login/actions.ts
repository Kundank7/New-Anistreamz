'use server';

import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

import bcrypt from 'bcrypt';

export async function authenticate(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const validUsername = process.env.ADMIN_USERNAME;
  const validPasswordHash = process.env.ADMIN_PASSWORD;

  if (username === validUsername && validPasswordHash && bcrypt.compareSync(password, validPasswordHash)) {
    // Valid credentials, set session
    await login(username);
    redirect('/admin');
  } else {
    // Add an artificial delay to mitigate timing attacks and basic brute forcing
    await new Promise(resolve => setTimeout(resolve, 500));
    return { error: 'Invalid username or password. Are you sure you belong here?' };
  }
}
