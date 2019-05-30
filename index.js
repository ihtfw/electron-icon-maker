#!/usr/bin/env node

const Jimp = require("jimp");
const args = require('args');
const path = require('path');
const fs = require('fs');
const icongen = require( 'icon-gen' );

var toGen = [
    {
        prefix: 'android-chrome',
        sizes: [36, 48, 72, 96, 144, 192],
        appendSize: true
    },
    {
        prefix: 'apple-touch-icon',
        sizes: [57, 60, 72, 76, 114, 120, 144, 152, 180],
        appendSize: true
    },
    {
        prefix: 'favicon',
        sizes: [16, 32, 96],
        appendSize: true
    },
    {
        prefix: 'mstile',
        sizes: [70, 144, 150, 310],
        appendSize: true
    },
    {
        prefix: 'apple-touch-icon',
        sizes: [180],
        appendSize: false
    },
    {
        prefix: 'apple-touch-icon-precomposed',
        sizes: [180],
        appendSize: false
    }
]

args
    .option('input', 'Input PNG file. Recommended (1024x1024)', './icon.png')
    .option('output', 'Folder to output new icons folder', './');

const flags = args.parse(process.argv);
console.log(flags);

// correct paths
var input = path.resolve(process.cwd(), flags.input);
var output = path.resolve(process.cwd(), flags.output);
if (!output.endsWith('/')){
    output = output + '/';
}

const start = async () => {    
    try{
        //pngs
        await asyncForEach(toGen, async (info) => {
            await asyncForEach(info.sizes, async (size) => {
    
                let fileName = info.prefix + '.png';
    
                if (info.appendSize){
                    fileName = info.prefix +  '-' + size.toString() + 'x' + size.toString() + '.png';
                }
                await createPNG(output, fileName, size);
            });
        });
    
        //icon
        await asyncForEach([16,24,32,48,64,128,256,512,1024], async (size) => {
            await createPNG(output + 'iconparts/', size.toString() + '.png', size);
        });
        await icongen(output + 'iconparts/', output, {type: 'png',names: {ico:'favicon'}, modes:['ico'], report: true} );
    }catch(err){
        console.log('ERROR!! ' + err);
    }
  }

start();

async function createPNG(outputDir, fileName, size) {    
    // make dir if does not exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const image = await Jimp.read(input);    
    image.resize(size, size).write(outputDir + fileName);

    console.log('Created ' + outputDir + fileName);
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}