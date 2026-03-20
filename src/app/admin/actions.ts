'use server'

export async function uploadToGitHub(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file || file.size === 0) {
    throw new Error("No file provided or file is empty");
  }
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString('base64');

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = process.env.GITHUB_REPO;
  const USER = process.env.GITHUB_USERNAME;

  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${fileName}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload ${fileName}`,
      content: content,
    }),
  });

  if (!response.ok) {
  const errorData = await response.json();
  console.log("Full GitHub Error:", errorData); // Yeh terminal mein dikhega
  throw new Error(errorData.message || "Unknown GitHub Error");
  }

  const result = await response.json();
// jsDelivr link return karein
return `https://cdn.jsdelivr.net/gh/${USER}/${REPO}@main/${fileName}`;

}