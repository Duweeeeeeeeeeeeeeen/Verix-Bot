
import { useRouter } from 'next/router';

export default function TestPage() {
  const router = useRouter();
  const { guildId } = router.query;
  return (
    <>
      <h1>Test Page Works!</h1>
      <p>Guild ID: {guildId}</p>
    </>
  );
}
