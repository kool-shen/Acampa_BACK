const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.stripe_secret);

/// route checkout

router.post("/create-checkout-session", async (req, res) => {
  const cart = req.body; // Utilisez req.body directement

  const lineItems = cart.map((product) => {
    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: product.nom,
          images: [product.photo],
        },
        unit_amount: product.prix * 100,
      },
      quantity: product.quantité,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:3001/",
    cancel_url: "http://localhost:3001/Fleurs",
  });

  res.json({ id: session.id });
  console.log(lineItems);
});

////

router.get("/allProducts", function (req, res) {
  stripe.products.list({}, function (err, products) {
    if (err) {
      console.log(err);
      res
        .status(500)
        .send({ error: "Erreur lors de la récupération des produits" });
    } else {
      const productList = products.data.map(function (product) {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.images[0],
        };
      });
      res.status(200).send(productList);
      console.log(productList);
    }
  });
});

module.exports = router;
