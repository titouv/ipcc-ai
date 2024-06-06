import { CheerioAPI, load } from "cheerio";

interface FigurePage {
  title: string;
  caption: string;
  img: string;
  url: string;
}

function getMatchingSelectorText(selectors: string[], $: CheerioAPI) {
  for (const selector of selectors) {
    const text = $(selector).text();
    if (text) {
      return text;
    }
  }
  throw new Error("No text found");
}

async function parseFigurePage(url: string): Promise<FigurePage> {
  const html = await fetch(url).then((res) => res.text());
  const $ = load(html);

  // get imag
  const imageSelector = ".img-card";
  const titleSelectors = [
    ".Body-copy_Figures--tables-etc_•-Figure-title--bold-to-------spans-columns",
    ".Body-copy_Figures--tables-etc_•-Figure-title--bold-to-------spans-columns---Notes-below",
    "._idGenObjectLayout-1 Body-copy_Boxes_Blue-Boxes_•-Box-extract",
    ".Body-copy_Boxes_Blue-Boxes_•-Box-body",
  ];
  const captionSelectors = [
    ".Body-copy_Figures--tables-etc_•-Figure-table-note---no-title",
    ".Body-copy_Boxes_Blue-Boxes_•-Box-body",
  ];

  const img = $(imageSelector).attr("src")!;
  let title;
  try {
    title = getMatchingSelectorText(titleSelectors, $);
  } catch (e) {
    throw new Error(`Could not find title for ${url}`);
  }
  const caption = getMatchingSelectorText(captionSelectors, $);

  return { title, caption, img, url };
}

export async function getGiecFigurePages() {
  const baseUrl = "https://www.ipcc.ch/";
  const url =
    "https://www.ipcc.ch/report/ar6/wg1/figures/summary-for-policymakers/";
  const html = await fetch(url).then((res) => res.text());
  const $ = load(html);
  const selector =
    "#gatsby-focus-wrapper > div > div > section > div > div > div > div > div > div";

  // iterate and get href
  const links = $(selector).find("a");
  const hrefs = links.map((i, el) => $(el).attr("href")).get();
  const completeHrefs = hrefs.map((href) => baseUrl + href);

  // get all figures
  const figures = await Promise.all(
    completeHrefs.map(async (href) => {
      console.log(href);
      const figure = await parseFigurePage(href);
      return figure;
    })
  );

  console.log(figures);
  return figures;
}

getGiecFigurePages();
