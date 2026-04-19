
import Layout from '../../../components/Layout';
import { useRouter } from 'next/router';

export default function TestPage() {
  const router = useRouter();
  const { guildId } = router.query;
  return (
    <Layout guildId={guildId}>
      <h1>Test Page Works!</h1>
      <p>Guild ID: {guildId}</p>
    </Layout>
  );
}
