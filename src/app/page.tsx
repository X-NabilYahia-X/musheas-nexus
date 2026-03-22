
import { redirect } from 'next/navigation';

export default function HomePage() {
  // التوجيه الافتراضي لصفحة تسجيل الدخول لبدء تجربة المستخدم بشكل صحيح
  redirect('/login');
}
