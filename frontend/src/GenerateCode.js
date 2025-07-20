export default function GenerateCode() {
  let rand = Math.floor(Math.random() * 10 + 10);
  let allChar = "ABCDEFGHIJKLMNOPQRSTVXYZ" + "0123456789" + "_-@?";
  let uniqueId = "";
  while (rand > 0) {
    let newRand = Math.floor(Math.random() * allChar.length);
    uniqueId += allChar[newRand];
    rand -= 1;
  }
  return uniqueId;
};
