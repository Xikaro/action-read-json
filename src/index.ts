import * as core from "@actions/core";
import fs from "fs";
import util from "util";
const readFileAsync = util.promisify(fs.readFile);

// Рекурсивно создаёт output для всех ключей, включая вложенные
function setOutputs(obj: any, prefix: string = "", flatArrays: boolean = false, yamlArrays: boolean = false) {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return;
  }

  for (const key in obj) {
    const value = obj[key];
    const outputKey = prefix ? `${prefix}_${key}` : key;

    // Если значение — массив
    if (Array.isArray(value)) {
      if (flatArrays) {
        // Плоский режим: строка значений в кавычках через пробел
        const flatString = value.map((item: any) => `"${item}"`).join(" ");
        core.setOutput(outputKey, flatString);
      } else if (yamlArrays) {
        // YAML режим: строка значений в кавычках через запятую
        const yamlString = value.map((item: any) => `"${item}"`).join(", ");
        core.setOutput(outputKey, yamlString);
      } else {
        // JSON режим: массив как JSON строка
        core.setOutput(outputKey, JSON.stringify(value));
      }

      value.forEach((item: any, idx: number) => {
        core.setOutput(`${outputKey}_${idx}`, item);
        // Рекурсивно обрабатываем вложенные объекты внутри массива
        if (item !== null && typeof item === "object") {
          setOutputs(item, `${outputKey}_${idx}`, flatArrays, yamlArrays);
        }
      });
      // Также создаём output для первого элемента (удобно для частого случая)
      if (value.length > 0) {
        core.setOutput(`${outputKey}_first`, value[0]);
      }
    }
    // Если значение — объект, рекурсивно создаём output для его ключей
    else if (value !== null && typeof value === "object") {
      setOutputs(value, outputKey, flatArrays, yamlArrays);
    }
    // Примитивное значение
    else {
      core.setOutput(outputKey, value);
    }
  }
}

async function run() {
  const file_path: string = core.getInput("file_path");
  const prop_path: string = core.getInput("prop_path");
  const flat_arrays: string = core.getInput("flat_arrays");
  const yaml_arrays: string = core.getInput("yaml_arrays");
  let pathArr: string[] = [];

  if (prop_path) {
    pathArr = prop_path.split(".");
  }

  try {
    const buffer = await readFileAsync(file_path);
    let json = JSON.parse(buffer.toString());

    if (pathArr.length > 0) {
      json = pathArr.reduce(
        (obj, key) =>{
          const idxStrReg = key.match(/(\[)[0-9]+(])/);
          if(idxStrReg){
            const arrKey = key.replace(/(\[)[0-9]+(])/, "");
            const idxReg = idxStrReg[0].match(/[0-9]+/);
            if (idxReg){
              const idx = idxReg[0];
              return key && obj && obj[arrKey] !== "undefined" && obj[arrKey][idx] !== "undefined" ? obj[arrKey][idx] : undefined;
            }
          }
          return key && obj && obj[key] !== "undefined" ? obj[key] : undefined;
        },
        json
      );
    }
    if (json && typeof json === "object") {
      setOutputs(json, "", flat_arrays.toLowerCase() === "true", yaml_arrays.toLowerCase() === "true");
    } else if (json) {
      core.setOutput("value", json);
    } else {
      core.setFailed(`can not find prop_path: ${prop_path} in json file.`);
    }
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      core.setFailed(error);
    }
  }
}

run();
