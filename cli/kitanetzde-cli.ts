import {KitaNetzDE} from "../server/src/modules/kitanetzde/main";

const kitanetztool = new KitaNetzDE();
console.log(kitanetztool.search(null, 10247));