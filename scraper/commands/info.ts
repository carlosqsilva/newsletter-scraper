import type { Storage } from "../database";
import type { InfoContent } from "../newsletter/common/helper.ts";
import { defined } from "../utils.ts";

export function getURLInfo(infoUrl: string, storage: Storage) {
  const issue = storage.getIssue(infoUrl);
  if (!defined(issue)) console.log("nothing!");
  const { data, date, id, source, url } = issue;

  console.table({ id, date, source, url });
  const contentList = (JSON.parse(data) ?? []) as InfoContent[];

  if (!defined) console.log("no content!");

  console.table(
    contentList.map((info) => {
      const description = `${info.description.slice(0, 30)}...`;

      return {
        url: info.link,
        sponsor: info.isSponsored,
        description,
      };
    }),
  );
}
