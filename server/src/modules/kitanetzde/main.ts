import {KitaNetzLANDOpts} from "./landopts";
import * as path from "path";
import * as rp from "request-promise-native";
import * as cheerio from 'cheerio';
import {Promise} from "es6-promise";

class KitaNetzDEPageResults {
    constructor(pageNumber:number, hasNextPage: boolean, kitaLink: [string]) {}
}

export class KitaNetzDE {
    // http://www.kitanetz.de/kitasuche/kita-suchergebnis.php?t_suchwort=lichtenberg&t_plz=&t_stadt=&t_land=
    baseUrl = "http://www.kitanetz.de/kitasuche/kita-suchergebnis.php";

    search(keyword: string, plz: number, city: string, land: KitaNetzLANDOpts) {
        const links = [];
        this.getPage(keyword, plz, city, land, 1).then();
    };

    getPage(keyword: string, plz: number, city: string, land: KitaNetzLANDOpts, pageNumber: number): Promise<KitaNetzDEPageResults> {
        const options = {
            uri: this.baseUrl,
            qs: {
                t_suchwort: keyword || "",
                t_plz: plz || "",
                t_stadt: city || "",
                t_land: land || "",
                go: pageNumber
            },
            transform: body => cheerio.load(body)
        };
        return new Promise((resolve, reject) => {
            rp(options).then(($) => {
                const links = $("#inhalt").children("a").filter((i, el) => {
                    return $(el).attr("title") != "Home";
                }).map((i, el) => {
                    return path.join(this.baseUrl, $(el).attr("href"));
                }).get();
                const hasNextLink = $("#navigation").children("a").filter((i, el) => el.html() == " » ").length
                return resolve(new KitaNetzDEPageResults(pageNumber, hasNextLink, links));
            }).catch((err) => {
                console.error(err);
                reject(err);
            });
        });
    }
}