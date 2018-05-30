import {KitaNetzLANDOpts} from "./landopts";
import * as path from "path";
import * as rp from "request-promise-native";
import * as cheerio from 'cheerio';
import {Promise} from "es6-promise";
import {AsyncQueue, queue} from 'async';

// class KitaNetzDEPageResults {
//     constructor(public pageNumber:number, public hasNextPage: boolean, public kitaLinks: [string]) {}
// }

class KitaResult {
    constructor(public email:string, public phoneNumber:string, public address: string) {}
}

export class KitaNetzDE {
    // http://www.kitanetz.de/kitasuche/kita-suchergebnis.php?t_suchwort=lichtenberg&t_plz=&t_stadt=&t_land=
    private static baseUrl = "http://www.kitanetz.de/kitasuche/kita-suchergebnis.php";
    private static baseUrlForKita = "http://www.kitanetz.de/";
    private searchResultsQ:AsyncQueue<{pageNumber:number}> = null;
    private kitaPagesQ:AsyncQueue<{kitaUrl:string, pageNumber:number}> = null;
    private queuedPages:number[] = [];
    private results:KitaResult[] = [];

    private keyword:string;
    private plz:number;
    private city:string;
    private land:KitaNetzLANDOpts;

    constructor(keyword: string, plz: number, city: string, land: KitaNetzLANDOpts) {
        this.keyword = keyword;
        this.plz = plz;
        this.city = city;
        this.land = land;

        // define a q to process the search page results
        this.searchResultsQ = queue<{pageNumber:number}, object>((task, callback) =>
            this.getSearchPage(this.keyword, this.plz, this.city, this.land, task.pageNumber, callback), 4);
        this.searchResultsQ.pause();

        // push first page
        this.searchResultsQ.push({ pageNumber: 1 }, () => this.kitaPagesQ.resume());
        this.queuedPages.push(1);

        // define a q to process each result
        this.kitaPagesQ = queue<{kitaUrl:string, pageNumber:number}, object>((task:{kitaUrl:string, pageNumber:number}, callback) =>
            this.getKitaPage(task.kitaUrl, task.pageNumber, callback), 4);
        this.kitaPagesQ.pause();
    }

    search(): Promise<KitaResult[]> {
        return new Promise((resolve, reject) => {
            this.searchResultsQ.resume();
            this.kitaPagesQ.drain = () => { resolve(this.results) };
        });

    };

    getSearchPage(keyword:string, plz:number, city:string, land:KitaNetzLANDOpts, pageNumber:number, callback) {
        const options = {
            uri: KitaNetzDE.baseUrl,
            qs: {
                t_suchwort: this.keyword || "",
                t_plz: this.plz || "",
                t_stadt: this.city || "",
                t_land: this.land || "",
                go: pageNumber
            },
            transform: body => cheerio.load(body)
        };
        // console.log(options);
        rp(options).then(($) => this.parseSearchPage($, pageNumber, callback));
    }

    parseSearchPage($, pageNumber, callback) {
        const links = $("#inhalt").children("a").filter((i, el) => {
            return $(el).attr("title") != "Home";
        }).map((i, el) => {
            return KitaNetzDE.baseUrlForKita + $(el).attr("href").replace("../", "")
                .replace("http:/www", "http://www");
        }).get();
        const pageNumbers = $("#navigation")
            .children("a")
            .filter((i, el) => $(el).text().trim() != "»" && $(el).text().trim() != "«")
            .map((i, el) => parseInt($(el).text()))
            .get();
        links.forEach(kitaUrl => {
            this.kitaPagesQ.push({ kitaUrl, pageNumber });
        });

        pageNumbers.forEach((page) => {
            if (this.queuedPages.indexOf(page) < 0) {
                this.queuedPages.push(page);
                this.searchResultsQ.push({ pageNumber: page });
            }
        });
        callback();
    }

    getKitaPage(kitaUrl:string, pageNumber:number, callback) {
        const options = { uri: kitaUrl, transform: body => cheerio.load(body) };
        // console.log(kitaUrl, pageNumber);
        rp(options).then(($) => this.parseKitaPage($, kitaUrl, pageNumber, callback));
    }

    parseKitaPage($, kitaUrl:string, pageNumber:number, callback) {
        const main = $("main[role='main']").first();
        const title = main.children("h1").first().text();
        const address = main.find(".zeilen").first().text()
            .replace("\n", " ")
            .replace("<br>", " ")
            .replace("\n", " ")
            .trim();
        console.log({
            title,
            address,
            kitaUrl,
            pageNumber
        });
        callback();
    }
}