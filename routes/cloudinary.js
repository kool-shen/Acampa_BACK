var express = require("express");
var router = express.Router();
const cloudinary = require("cloudinary").v2;
const cloud_name = process.env.cloud_name;
const api_key = process.env.api_key;
const api_secret = process.env.api_secret;

cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
  metadata: true,
});

/// Photos de la Home ///

router.get("/homepage", function (req, res) {
  const expression = `folder:Homepage/* `;

  cloudinary.search
    .expression(expression)
    .sort_by("public_id", "desc")
    .max_results(500)
    .with_field("metadata")
    .with_field("context")

    .execute()
    .then((result) => {
      const filteredData = result.resources.map((item) => {
        return {
          collection: item.folder.split("/").pop(),
          src: item.secure_url,
          height: item.height,
          width: item.width,
          metadata: item.metadata,
          context: item.context,
        };
      });
      res.json(filteredData);
      console.log(filteredData);
    })
    .catch((error) => console.error());
});

/// Objets du shop ///

router.get("/shop", function (req, res) {
  const expression = `folder:Shop/* `;

  cloudinary.search
    .expression(expression)
    .sort_by("public_id", "desc")
    .max_results(500)
    .with_field("metadata")
    .with_field("image_metadata")
    .with_field("context")
    .execute()
    .then((result) => {
      const filteredData = result.resources.map((item) => {
        return {
          collection: item.folder.split("/").pop(),
          src: item.secure_url,
          height: item.height,
          width: item.width,
          metadata: item.metadata,
          context: item.context,
        };
      });
      const flowers = filteredData.filter(
        (item) => item.collection === "Fleurs"
      );
      const others = filteredData.filter(
        (item) => item.collection !== "Fleurs"
      );
      const sortedData = flowers.concat(others);
      res.json(sortedData);
      console.log(sortedData);
    })
    .catch((error) => console.error());
});

/// sous catégories du shop, avec "Fleurs" en premier ////

router.get("/folders", function (req, res) {
  cloudinary.api.sub_folders("Shop", function (error, result) {
    if (error) {
      console.log();
      res.status(500).send("Erreur lors de la récupération des sous-dossiers");
    } else {
      const folders = result.folders;
      const fleursObj = folders.find((folder) => folder.name === "Fleurs");
      if (fleursObj) {
        folders.splice(folders.indexOf(fleursObj), 1);
      }
      folders.sort((a, b) => {
        if (a.name === "Fleurs") return -1;
        if (b.name === "Fleurs") return 1;
        return 0;
      });
      if (fleursObj) {
        folders.unshift(fleursObj);
      }
      res.json(folders);
    }
  });
});

/// Route index prestations ///

router.get("/indexPresta", async (req, res) => {
  try {
    const { folders } = await cloudinary.api.sub_folders("Prestations");
    const sortedFolders = folders.sort((a, b) => a.name.localeCompare(b.name));
    const folderNames = sortedFolders.map((folder) => folder.name);
    res.json(folderNames);
    console.log(folderNames[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la récupération des sous-dossiers");
  }
});

/// Photos de presta ///

router.get("/prestations", function (req, res) {
  const expression = `folder:Prestations/* `;

  cloudinary.search
    .expression(expression)
    .sort_by("public_id", "desc")
    .max_results(500)
    .with_field("metadata")
    .with_field("context")
    .execute()
    .then((result) => {
      const sortedResources = result.resources.sort((a, b) =>
        a.folder.localeCompare(b.folder)
      );
      const filteredData = sortedResources.map((item) => {
        return {
          collection: item.folder.split("/").pop(),
          src: item.secure_url,
          height: item.height,
          width: item.width,
          metadata: item.metadata,
          context: item.context,
        };
      });
      res.json(filteredData);
      console.log(filteredData);
    })
    .catch((error) => console.error());
});
//// Route test ////

router.get("/test", function (req, res) {
  cloudinary.api.resources_by_asset_folder(
    "Home",
    { metadata: true },
    function (error, result) {
      console.log();
    }
  );
  cloudinary.api
    .resources({ max_results: 500, context: true })
    .then((data) => console.log(data));
});

////

router.get("/get-all-images-metadata", function (req, res) {
  // Récupération de toutes les ressources d'upload avec les métadonnées structurées
  cloudinary.api.resources(
    { max_results: 500, metadata: true },
    function (error, result) {
      if (error) {
        console.log(error);
      } else {
        // Construction d'un tableau d'objets contenant les informations des images et leurs métadonnées structurées
        const imagesWithMetadata = result.resources.map((image) => {
          return {
            publicId: image.public_id,
            format: image.format,
            width: image.width,
            height: image.height,
            metadata: image.metadata,
          };
        });
        console.log(imagesWithMetadata);
      }
    }
  );
});

/// meta
router.get("/metadata", function (req, res) {
  cloudinary.api
    .list_metadata_fields({ context: true })
    .then((result) => console.log(result));
  cloudinary.api
    .resources({ max_results: 500, context: true })
    .then((data) => console.log());
});
//cloudinary.v2.api.metadata_field_by_field_id(external_id, options).then(callback);
//cloudinary.v2.api.metadata_field_by_field_id('in_stock').then(result=>console.log(result));

module.exports = router;
