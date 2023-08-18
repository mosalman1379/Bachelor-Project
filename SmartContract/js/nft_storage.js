const {NFTStorage, File} = require('nft.storage');
const mime = require('mime');
const fs = require('fs');
const path = require('path');
const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjowe' +
    'Dg4QkY5M2M0ODUxOTUxRDQ4ODBmNDQzMzkwNDNFMjlkOGI0NDY3ZTUiLCJpc3MiOiJuZnQtc3RvcmFnZSIs' +
    'ImlhdCI6MTY5MTUyMDgxMjI2NiwibmFtZSI6IkJhY2hlbG9yIn0.DXEI2DMtb0EUBBVPhXIxOwhXVswfrpUj1_JbsaQes50'
async function storeNFT(imagePath, name, description) {
    const image = await fileFromPath(imagePath);
    const nftstorage = new NFTStorage({token: NFT_STORAGE_KEY});
    return nftstorage.store({
        image,
        name,
        description
    })
}

async function fileFromPath(filePath) {
    const content = await fs.promises.readFile(filePath);
    const type = mime.getType(filePath);
    return new File([content], path.basename(filePath), {type});
}

async function create_nft(image_file, name, description) {
    const root_path = path.dirname(path.dirname(__dirname));
    const file_path = `uploads/${image_file}`;
    const image_path = path.join(root_path, file_path);
    const result = await storeNFT(image_path, name, description);
    return result;
}
module.exports.create_nft = create_nft;