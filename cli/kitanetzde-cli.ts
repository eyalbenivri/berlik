import { KitaNetzDE } from "../server/src/modules/kitanetzde/main";
import * as prettyjson from 'prettyjson';

const kitanetztool = new KitaNetzDE(null, 10247, null, null);
kitanetztool.search()
    .then(data => console.log(prettyjson.render(data)));