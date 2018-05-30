import {KitaNetzLANDOpts} from "./landopts";
import * as path from "path";
import * as rp from "request-promise-native";
import * as cheerio from 'cheerio';
import {Promise} from "es6-promise";
import { doWhilst, queue } from 'async';

class KitaNetzDEPageResults {
    constructor(public pageNumber:number, public hasNextPage: boolean, public kitaLinks: [string]) {}
}

class KitaResult {
    constructor(public email:string, public phoneNumber:string, public address: string) {}
}

export class KitaNetzDE {
    // http://www.kitanetz.de/kitasuche/kita-suchergebnis.php?t_suchwort=lichtenberg&t_plz=&t_stadt=&t_land=
    baseUrl = "http://www.kitanetz.de/kitasuche/kita-suchergebnis.php";
    constructor(keyword: string, plz: number, city: string, land: KitaNetzLANDOpts) {
        // define a q to process the search page results
        this.searchResultsQ = queue(this.searchPage, 4);


        // define a q to process each result
        const kitaPagesQ = queue(this.parseKitaPage, 4);
    }

    search(): Promise<[KitaResult]> {
        return new Promise((resolve, reject) => {
            const results: [KitaResult] = [];


            q.pause();
            q.drain = () => { resolve(results) };
            let pageNumber = 1;
            doWhilst((callback) => {
                this.getPage(keyword, plz, city, land, pageNumber++)
                    .then((pageResults:KitaNetzDEPageResults) => {
                        if (pageResults.kitaLinks.length > 0) {
                            pageResults.kitaLinks.forEach((url) => q.push({url}));
                        }
                        callback();
                    });
            }, (results) => results.last().hasNextPage)
        });

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
                const pagesLinks = $("#navigation").children("a");
                const hasNextLink = pagesLinks.filter((i, el) => $(el).text() == " » ").length > 0;
                return resolve(new KitaNetzDEPageResults(pageNumber, hasNextLink, links));
            }).catch((err) => {
                console.error(err);
                reject(err);
            });
        });
    }
}