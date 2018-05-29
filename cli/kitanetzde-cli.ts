import { KitaNetzDE } from "../server/src/modules/kitanetzde/main";
import * as prettyjson from 'prettyjson';

const kitanetztool = new KitaNetzDE();
kitanetztool.search(null, 10247, null, null)
    .then(data => console.log(prettyjson.render(data)));