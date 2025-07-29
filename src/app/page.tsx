export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const attributes = await fetch(`${baseUrl}/api/attributes`, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        name: { $eq: "Color" },
      },
    }),
  });

  const attributesData = await attributes.json();

  console.log(attributesData);

  return <main>Hello world</main>;
}
