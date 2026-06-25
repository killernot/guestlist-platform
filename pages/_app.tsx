import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import AdminLayout from "../components/admin/AdminLayout";
import "@/styles/globals.css";

export default function App({ Component, pageProps, router }: AppProps) {
  const isAdmin = router.pathname.startsWith("/admin");

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
      </Head>
      {isAdmin ? (
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}
