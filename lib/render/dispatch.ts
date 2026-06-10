// Dispara o workflow de render (Puppeteer + ffmpeg no GitHub Actions) que cria
// os PNGs/MP4 de uma coleção e os guarda em dias[].imagens / dias[].videoUrl.
// Usado pelo publicador automático para PREPARAR sozinho a media que falta —
// para que "estar na Agenda" baste para se publicar (sem passos à mão).

// Revisão atual da capa. Sobe quando mudamos algo que obriga a re-render
// (ex.: a correção que mete a imagem-assinatura na capa). O publicador só
// publica carrosséis com esta revisão; os antigos são re-renderizados sozinhos.
export const CAPA_REV = 2;

export async function dispararRender(slug: string): Promise<boolean> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannedossantos.com';
  if (!token) return false;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-carrossel-veus.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref, inputs: { slug, siteUrl } }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}
