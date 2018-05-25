import {KitaNetzLANDOpts} from "./landopts";
import * as path from "path";
import * as rp from "request-promise-native";
import * as cheerio from 'cheerio';

export class KitaNetzDE {
    // http://www.kitanetz.de/kitasuche/kita-suchergebnis.php?t_suchwort=lichtenberg&t_plz=&t_stadt=&t_land=
    baseUrl = "http://www.kitanetz.de/kitasuche/kita-suchergebnis.php";

    search(keyword: string = null, plz: number = null, city: string = null, land: KitaNetzLANDOpts = null) {
        const options = {
            uri: this.baseUrl,
            qs: {
                t_suchwort: keyword || "",
                t_plz: plz || "",
                t_stadt: city || "",
                t_land: land || ""
            },
            transform: body => cheerio.load(body)
        }

        rp(options).then(($) => {
            const links = $("#inhalt").children("a").map((i, el) => {
                return path.join(this.baseUrl, $(el).attr("href"));
            }).get();
            console.log(links);
        }).catch((err) => {
            console.error(err);
        });
    }
}