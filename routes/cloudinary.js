var express = require("express");
var router = express.Router();
const cloudinary = require("cloudinary").v2;
const cloud_name = process.env.cloud_name;
const api_key = process.env.api_key;
const api_secret = process.env.api_secret;

console.log(cloud_name);

cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});

/// Photos de la Home ///
router.get("/homepage", function (req, res) {
  cloudinary.api.resources({ max_results: 500 }).then((data) => {
    const filteredData = data.resources
      .filter((item) => {
        return item.folder.split("/").pop() === "Homepage";
      })
      .map((item) => {
        return {
          collection: item.folder.split("/").pop(),
          src: item.url,
          height: item.height,
          width: item.width,
        };
      });
    res.json(filteredData);
    console.log(filteredData);
  });
});

/// Photos du shop ///

router.get("/shop", function (req, res) {
  const expression = `folder:Shop/*`;

  cloudinary.search
    .expression(expression)
    .sort_by("public_id", "desc")
    .max_results(500)
    .execute()
    .then((result) => {
      const filteredData = result.resources.map((item) => {
        return {
          collection: item.folder.split("/").pop(),
          src: item.secure_url,
          height: item.height,
          width: item.width,
        };
      });
      res.json(filteredData);
      console.log(filteredData);
    })
    .catch((error) => console.error(error));
});

/// sous catégories du shop ////

router.get("/folders", function (req, res) {
  cloudinary.api.sub_folders("Shop", function (error, result) {
    if (error) {
      console.log(error);
      res.status(500).send("Erreur lors de la récupération des sous-dossiers");
    } else {
      const folders = result.folders;
      // Trouver l'objet qui contient "Fleurs" et l'enlever du tableau
      const fleursObj = folders.find((folder) => folder.name === "Fleurs");
      if (fleursObj) {
        folders.splice(folders.indexOf(fleursObj), 1);
      }
      // Trier le tableau en mettant l'objet qui contient "Fleurs" en premier
      folders.sort((a, b) => {
        if (a.name === "Fleurs") return -1;
        if (b.name === "Fleurs") return 1;
        return 0;
      });
      // Ajouter l'objet qui contient "Fleurs" au début du tableau si présent
      if (fleursObj) {
        folders.unshift(fleursObj);
      }
      res.json(folders);
    }
  });
});

//// Route test ////

router.get("/", function (req, res) {
  cloudinary.api.resources_by_asset_folder(
    "Home",
    { metadata: true },
    function (error, result) {
      console.log(result, error);
    }
  );
  cloudinary.api
    .resources({ max_results: 500 })
    .then((data) => console.log(data));
});

/// meta
router.get("/metadata", function (req, res) {
  cloudinary.api.list_metadata_fields();
  cloudinary.api
    .resources({ max_results: 500 })
    .then((data) => console.log(data));
});

//cloudinary.v2.api.list_metadata_fields(options).then(callback);

module.exports = router;
