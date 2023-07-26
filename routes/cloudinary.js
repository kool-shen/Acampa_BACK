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
  const expression = `folder:"Homepage/photos home"`;

  cloudinary.search
    .expression(expression)
    .sort_by("updated_at", "desc")
    .max_results(500)
    .with_field("metadata")
    .with_field("context")

    .execute()
    .then((result) => {
      const filteredData = result.resources.map((item) => {
        return {
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

/// Texte présentation Acampa

router.get("/presentation", function (req, res) {
  const expression = `folder:"Homepage/Texte présentation"`;

  cloudinary.search
    .expression(expression)
    .sort_by("updated_at", "desc")
    .max_results(500)
    .with_field("metadata")
    .with_field("context")

    .execute()
    .then((result) => {
      const filteredData = result.resources.map((item) => {
        return {
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
    .sort_by("created_at", "desc")
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
      console.log(resources);
    })
    .catch((error) => console.error());
});

///Génère page collection shop ///

router.get("/collection", async (req, res) => {
  const { collection } = req.query;

  try {
    const expression = `folder:"Shop/${collection}"`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "asc")
      .max_results(500)
      .with_field("metadata")
      .with_field("context")
      .execute();

    const filteredData = result.resources.map((item) => {
      return {
        collection: item.folder.split("/").pop(),
        src: item.secure_url,
        height: item.height,
        width: item.width,
        name: item.metadata.nom_du_produit,
        price: item.metadata.prix,
        twin: item.metadata.twin,
        context: item.context,
        duree: item.metadata.duree,
        vin: item.metadata.vin,
      };
    });

    res.status(200).json(filteredData);
    console.log(filteredData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//// Génère page produit ///

router.get("/product", async (req, res) => {
  const { product } = req.query;
  try {
    const decodedProduct = decodeURIComponent(product); // Décoder l'URL
    const cleanedProduct = decodedProduct.replace("%20%26%20", "&");

    const expression = `folder:Shop/* AND metadata.nom_du_produit:"${cleanedProduct}" AND metadata.nom_du_produit = "${cleanedProduct}"`;
    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc")
      .max_results(500)
      .with_field("metadata")
      .with_field("context")
      .execute();

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

    res.status(200).json(filteredData);

    console.log(filteredData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/*router.get("/product", async (req, res) => {
  const { product } = req.query;
  try {
    const expression = `folder:Shop/* AND metadata.nom_du_produit:"${product}" AND metadata.nom_du_produit = "${product}"`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc")
      .max_results(500)
      .with_field("metadata")
      .with_field("context")
      .execute();

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

    res.status(200).json(filteredData);

    console.log(`ça c'est le ${product}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});*/
/// sous catégories du shop, avec "Fleurs" en premier ////

router.get("/shopSubcategories", function (req, res) {
  cloudinary.api.sub_folders("Shop", function (error, result) {
    if (error) {
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
      console.log(folders);
    }
  });
});

/// sous catégories du shop, avec "Fleurs" en premier ////

router.get("/aboutSubcategories", function (req, res) {
  cloudinary.api.sub_folders("À Propos", function (error, result) {
    if (error) {
      res.status(500).send("Erreur lors de la récupération des sous-dossiers");
    } else {
      const folders = result.folders;
      res.json(folders);
      console.log(folders);
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
  const expression = `folder:"Prestations/Photos"`;

  cloudinary.search
    .expression(expression)
    .sort_by("created_at", "asc")
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

// texte de presta

router.get("/prestationsTexte", function (req, res) {
  const expression = `folder:"Prestations/Texte"`;

  cloudinary.search
    .expression(expression)
    .sort_by("created_at", "asc")
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
          metadata: item.metadata.nom_du_produit,
          context: item.context.alt,
        };
      });
      res.json(filteredData);
      console.log(filteredData[0].context);
    })
    .catch((error) => console.error());
});

/// Route texte actu partie supérieure ///

router.get("/texteActu", async (req, res) => {
  const { collection } = req.query;

  try {
    const expression = `folder:"À Propos/Actu/Partie supérieure"`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("public_id", "desc")
      .max_results(500)
      .with_field("metadata")
      .with_field("context")
      .execute();

    const filteredData = result.resources.map((item) => {
      return {
        collection: item.folder.split("/").pop(),
        src: item.secure_url,
        height: item.height,
        width: item.width,
        name: item.metadata.nom_du_produit,
        price: item.metadata.prix,
        context: item.context,
      };
    });

    res.status(200).json(filteredData);
    console.log(filteredData);
    console.log(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/// route produits actu ///

router.get("/produitsActu", async (req, res) => {
  const { collection } = req.query;

  try {
    const expression = `folder:"À Propos/Actu/Partie inférieure"`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc")
      .max_results(4)
      .with_field("metadata")
      .with_field("context")
      .execute();

    const filteredData = result.resources.map((item) => {
      return {
        src: item.secure_url,
        height: item.height,
        width: item.width,
        ligne1: item.metadata?.ligne1,
        ligne2: item.metadata?.ligne2,

        ref: item.metadata?.ml4tdfywqkkgth7uun95,
        link: item.metadata?.jylb3tg4da9hlww71c4n,
        context: item.context,
      };
    });

    res.status(200).json(filteredData);
    console.log(filteredData);
    console.log(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/// route Acampa ///

router.get("/acampa", async (req, res) => {
  const { collection } = req.query;

  try {
    const expression = `folder:"À Propos/Acampà"`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("public_id", "desc")
      .max_results(4)
      .with_field("metadata")
      .with_field("context")
      .execute();

    const filteredData = result.resources.map((item) => {
      return {
        src: item.secure_url,
        collection: item.collection,
        height: item.height,
        width: item.width,
        ligne1: item.metadata?.ligne1,
        context: item.context,
      };
    });

    res.status(200).json(filteredData);
    console.log(filteredData);
    console.log(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/// route Mentions Légales ///

router.get("/mentions", async (req, res) => {
  const { collection } = req.query;

  try {
    const expression = `folder:"À Propos/Mentions Légales"`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("public_id", "desc")
      .max_results(4)
      .with_field("metadata")
      .with_field("context")
      .execute();

    const filteredData = result.resources.map((item) => {
      return {
        ligne1: item.metadata?.ligne1,
        ligne2: item.metadata?.ligne2,
        context: item.context,
      };
    });

    res.status(200).json(filteredData);
    console.log(filteredData);
    console.log(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/// route Contact ///

router.get("/contact", async (req, res) => {
  const { collection } = req.query;

  try {
    const expression = `folder:"À Propos/Contact"`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("public_id", "desc")
      .max_results(4)
      .with_field("metadata")
      .with_field("context")
      .execute();

    const filteredData = result.resources.map((item) => {
      return {
        ligne1: item.metadata?.ligne1,
        context: item.context,
      };
    });

    res.status(200).json(filteredData);
    console.log(filteredData);
    console.log(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//// Routes test ////

//////////////////////////

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
