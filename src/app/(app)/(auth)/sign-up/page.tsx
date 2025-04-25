import { SignUpView } from '@/modules/auth/ui/views/sign-up-views';
import { caller } from '@/tRPC/server';
import { redirect } from 'next/navigation';

const Page = async () => {
  const session = await caller.auth.session();
  if (session.user) {
    redirect('/');
  }
  return <SignUpView />;
};

export default Page;
