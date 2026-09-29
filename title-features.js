/* ================================================
   CROSSED HEARTS — TITLE MEDIA & FEATURES
   Single-image cover · Edition switching · View More carousel modal · Retailer icons · Add to Cart
   Load AFTER script.js. Do not merge into script.js.
   ================================================ */

const CH_TITLE_MEDIA = {
  chigaya: {
    name: "You're Way Too Cheeky, Chigaya-kun!",
    volumes: {
      1: {
        label: "Volume 1",
        release: "May 26, 2026",
        pages: 190,
        synopsis:
          "Ever since the day they met, no matter how often she tries to brush him off, Natsune always finds herself at the center of Chigaya's playful aim. His words, his smiles, his relentless teasing — each one reserved just for her. As her heart races faster with every encounter, one question lingers in her mind: is his teasing truly just a joke… or does it mean something more? A charming, heart-fluttering high school romance between two archers.",
        editions: {
          standard: {
            label: "Standard",
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/youre-way-too-cheeky-chigaya-kun-vol-1",
            images: [
              "Images/Chigaya-vol 1.png",
              "Images/Chigaya-vol1-std1.png",
              "Images/Chigaya-vol1-std2.png",
              "Images/Chigaya-vol1-std3.png",
              "Images/Chigaya-vol1-std4.png",
              "Images/Chigaya-vol1-std5.png",
              "Images/Chigaya-vol1-std6.png",
              "Images/Chigaya-vol1-std7.png",
              "Images/Chigaya-vol1-std8.png",
              "Images/Chigaya-vol1-std9.png",
              "Images/Chigaya-vol1-std10.png",
            ],
          },
          limited: {
            label: "Limited",
            price: "$15.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/youre-way-too-cheeky-chigaya-kun-vol-1-limited-edition-with-shikishi",
            images: [
              "Images/Chigaya-vol1-ltd-cover.png",
              "Images/Chigaya-vol1-ltd1.png",
              "Images/Chigaya-vol1-ltd2.png",
              "Images/Chigaya-vol1-ltd3.png",
              "Images/Chigaya-vol1-ltd4.png",
              "Images/Chigaya-vol1-ltd5.png",
              "Images/Chigaya-vol1-ltd6.png",
              "Images/Chigaya-vol1-ltd7.png",
              "Images/Chigaya-vol1-ltd8.png",
              "Images/Chigaya-vol1-ltd9.png",
              "Images/Chigaya-vol1-ltd10.png",
            ],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "December 01, 2026",
        pages: 190,
        synopsis:
          "Ever since her cheeky junior, Chigaya, made her the sole target of his teasing, Natsune has tried to keep her composure. But when he suddenly falls ill and she finds herself tending to him, the distance she worked so hard to maintain begins to blur. Can she keep the proper distance between senior and junior… or has she already let him slip past her guard?",
        editions: {
          standard: {
            label: "Standard",
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/youre-way-too-cheeky-chigaya-kun-vol-2",
            images: [
              "Images/Chigaya-vol 2.png",
              "Images/Chigaya-vol2-std1.png",
              "Images/Chigaya-vol2-std2.png",
              "Images/Chigaya-vol2-std3.png",
              "Images/Chigaya-vol2-std4.png",
              "Images/Chigaya-vol2-std5.png",
              "Images/Chigaya-vol2-std6.png",
              "Images/Chigaya-vol2-std7.png",
              "Images/Chigaya-vol2-std8.png",
              "Images/Chigaya-vol2-std9.png",
              "Images/Chigaya-vol2-std10.png",
            ],
          },
          limited: {
            label: "Limited",
            price: "$15.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/youre-way-too-cheeky-chigaya-kun-vol-2-limited-edition-with-shikishi",
            images: [
              "Images/Chigaya-vol2-ltd-cover.png",
              "Images/Chigaya-vol2-ltd1.png",
              "Images/Chigaya-vol2-ltd2.png",
              "Images/Chigaya-vol2-ltd3.png",
              "Images/Chigaya-vol2-ltd4.png",
              "Images/Chigaya-vol2-ltd5.png",
              "Images/Chigaya-vol2-ltd6.png",
              "Images/Chigaya-vol2-ltd7.png",
              "Images/Chigaya-vol2-ltd8.png",
              "Images/Chigaya-vol2-ltd9.png",
              "Images/Chigaya-vol2-ltd10.png",
            ],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
        {
          name: "Manga Plaza",
          icon: "ti-device-tablet",
          url: "https://mangaplaza.com/title/0303012440/",
          available: true,
        },
        {
          name: "Amazon Kindle",
          icon: "ti-brand-amazon",
          url: "https://www.amazon.in/Youre-Way-Too-Cheeky-Chigaya-kun-ebook/dp/B0GLHMT7N2",
          available: true,
        },
        {
          name: "BookWalker",
          icon: "ti-book",
          url: "https://bookwalker.com/series/1MKRXY6RZ7A0/youre-way-too-cheeky-chigaya-kun",
          available: false,
        },
      ],
      print: [
        {
          name: "Barnes & Nobel (US)",
          icon: "ti-building-store",
          url: "https://www.barnesandnoble.com/search?q=You%27re%20way%20too%2C%20cheeky%20chihaya-kun",
          available: true,
        },
        {
          name: "Books-A-Million (US)",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search?query=You%27re%20Way%20Too%20Cheeky%2C%20Chigaya-Kun%21&filters[authors]=Mai%20Ando",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/search?q=You%27re+Way+Too+Cheeky%2C+Chigaya-Kun%21",
          available: true,
        },
        {
          name: "Pen & Sword (UK)",
          icon: "ti-building-store",
          url: "https://www.pen-and-sword.co.uk/search/products/You%27re+Way+Too+Cheeky%2C+Chigaya-kun%21",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/libros/search?q=You%27re+Way+Too+Cheeky%2C+Chigaya-kun",
          available: true,
        },
      ],
    },
  },

  zombie: {
    name: "The Abandoned Villainess Became A Zombie",
    format: "A5 Paperback",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 01, 2026",
        pages: 325,
        synopsis:
          "When I opened my eyes, I was no longer myself. I had become the villainess of a zombie apocalypse, with a zombie's teeth buried in me. And yet… I didn't die. When I returned unscathed, everyone looked at me as if I'd risen from the grave. Just one bite, I thought. These were the people who had abandoned me. Surely, one bite wouldn't hurt… right? But no. I would endure. I would survive. I would live. If I could hold out until a cure was found, maybe I could be human again. So I stayed by their side, hiding my secret — that I was no longer one of them. I was a zombie. Except… something's gone terribly wrong. \"Don't tell me to leave you again. I won't.\" Wait — what is happening here?! Why are they all acting like this?! A darkly comedic, pulse-racing fantasy about a zombie villainess who survives the apocalypse, only to discover that the real danger isn't the zombies outside… it's everything (and everyone) else inside.",
        editions: {
          standard: {
            label: "Standard",
            price: "$19.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-abandoned-villainess-became-a-zombie-vol-1",
            images: [
              "Images/Zombie-vol1-std-cover.png",
              "Images/Zombie-vol1-std1.png",
              "Images/Zombie-vol1-std2.png",
              "Images/Zombie-vol1-std3.png",
              "Images/Zombie-vol1-std4.png",
              "Images/Zombie-vol1-std5.png",
              "Images/Zombie-vol1-std6.png",
              "Images/Zombie-vol1-std7.png",
              "Images/Zombie-vol1-std8.png",
              "Images/Zombie-vol1-std9.png",
            ],
          },
          Special: {
            label: "Special",
            price: "$28.00",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-abandoned-villainess-became-a-zombie-vol-1-special-edition",
            images: [
              "Images/Zombie-vol1-spc-cover.png",
              "Images/Zombie-vol1-spc1.png",
              "Images/Zombie-vol1-spc2.png",
              "Images/Zombie-vol1-spc3.png",
              "Images/Zombie-vol1-spc4.png",
              "Images/Zombie-vol1-spc5.png",
              "Images/Zombie-vol1-spc6.png",
              "Images/Zombie-vol1-spc7.png",
              "Images/Zombie-vol1-spc8.png",
              "Images/Zombie-vol1-spc9.png",
            ],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "December 01, 2026",
        pages: 352,
        synopsis:
          "Penelope's secret is no longer hers alone. When the one she trusted most admits he knows she is a zombie and tells her he wants her to live, their shared secret briefly blooms into trust. But trust is a dangerous luxury in an apocalypse. If he knows… who else does? And when will the blade meant for her finally fall? Worse still is the betrayal — the same person who offered her hope confesses he deliberately harmed her to test the limits of her zombification. In a single instant, the fragile bond she built shatters. Yet survival offers no time to grieve. As a band of villagers seeking refuge begin to grow closer to the others, Penelope alone senses the danger beneath their weary smiles. They are not refugees. They are opportunists. The grain is their target, and once they drug the fortress, they will leave everyone to starve. Her secret is out, her trust is shattered, and the real threat just walked through the gates wearing a refugee's smile.",
        editions: {
          standard: {
            label: "Standard",
            price: "$19.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-abandoned-villainess-became-a-zombie-vol-2",
            images: [
              "Images/Zombie-vol2-std-cover.png",
              "Images/Zombie-vol2-std1.png",
              "Images/Zombie-vol2-std2.png",
              "Images/Zombie-vol2-std3.png",
              "Images/Zombie-vol2-std4.png",
              "Images/Zombie-vol2-std5.png",
              "Images/Zombie-vol2-std6.png",
              "Images/Zombie-vol2-std7.png",
              "Images/Zombie-vol2-std8.png",
              "Images/Zombie-vol2-std9.png",
            ],
          },
          Special: {
            label: "Special",
            price: "$28.00",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-abandoned-villainess-became-a-zombie-vol-2-special-edition",
            images: [
              "Images/Zombie-vol2-spc-cover.png",
              "Images/Zombie-vol2-spc1.png",
              "Images/Zombie-vol2-spc2.png",
              "Images/Zombie-vol2-spc3.png",
              "Images/Zombie-vol2-spc4.png",
              "Images/Zombie-vol2-spc5.png",
              "Images/Zombie-vol2-spc6.png",
              "Images/Zombie-vol2-spc7.png",
              "Images/Zombie-vol2-spc8.png",
              "Images/Zombie-vol2-spc9.png",
            ],
          },
        },
      },
    },
    bundle: {
      label: "Special Edition Bundle Set",
      price: "$40.00",
      // release: "Sep 29 – Oct 27, 2026",
      pages: 860,
      synopsis:
        "Volume 1 & Volume 2 in high-quality print editions\n\n* Exclusive Dust Jackets with enhanced artwork and Sprayed Edges for a refined, display-worthy look.",
      images: ["Images/Zombie-bundleset-cover.png"],
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
        {
          name: "Amazon Kindle",
          icon: "ti-brand-amazon",
          url: null,
          available: false,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search?query=The%20Abandoned%20Villainess%20Became%20a%20Zombie&filters[authors]=Dodo",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/search?q=The+Abandoned+Villainess+Became+a+Zombie",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/books/search?q=ABANDONED+VILLAINESS",
          available: true,
        },
      ],
    },
  },

  connie: {
    name: "All-Rounder Maid Connie Wille",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 01, 2026",
        pages: 222,
        synopsis:
          "Battle strategy? Impeccable. Domestic management? Effortless. Emotional restraint? Weaponized. Connie Wille is the ultimate all-rounder maid of Halvion Castle, blessed with cheat-level abilities and burdened by a single wish: to live quietly and out of the spotlight. That dream shatters the day she learns the empire's most notorious flirt and devastatingly handsome knight, Reinhardt, is now her stepbrother. Caught between a shamelessly meddlesome stepbrother who refuses to stay out of her affairs, a capable charismatic superior she admires, and a dangerously alluring prince she deeply respects, Connie is swept into a whirlwind of palace intrigue, covert missions, and heartaches she never planned for. A comedic-drama Josei where the heroine commands the narrative without being defined by love!",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/all-rounder-maid-connie-Wille-volume-1",
            images: [
              "Images/Connie-vol1-std-cover.png",
              "Images/Connie-vol1-std1.png",
              "Images/Connie-vol1-std2.png",
              "Images/Connie-vol1-std3.png",
              "Images/Connie-vol1-std4.png",
              "Images/Connie-vol1-std5.png",
              "Images/Connie-vol1-std6.png",
              "Images/Connie-vol1-std7.png",
              "Images/Connie-vol1-std8.png",
              "Images/Connie-vol1-std9.png",
              "Images/Connie-vol1-std10.png",
              "Images/Connie-vol1-std11.png",
            ],
          },
          limited: {
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/all-rounder-maid-connie-Wille-volume-1-limited-edition-with-shikishi",
            images: [
              "Images/Connie-vol1-ltd-cover.png",
              "Images/Connie-vol1-ltd1.png",
              "Images/Connie-vol1-ltd2.png",
              "Images/Connie-vol1-ltd3.png",
              "Images/Connie-vol1-ltd4.png",
              "Images/Connie-vol1-ltd5.png",
              "Images/Connie-vol1-ltd6.png",
              "Images/Connie-vol1-ltd7.png",
              "Images/Connie-vol1-ltd8.png",
              "Images/Connie-vol1-ltd9.png",
              "Images/Connie-vol1-ltd10.png",
              "Images/Connie-vol1-ltd11.png",
            ],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "December 01, 2026",
        pages: 216,
        synopsis:
          "Connie Wille may be an absurdly overpowered castle maid, but all she wants is a calm, practical life. However, when her mother Michelle — who possesses the dangerous power of Charm that can drive men mad — remarries Duke Dougler of Halvion, everything spirals out of control. Suddenly, the empire's most infamous and devastatingly handsome flirt, Reinhardt, becomes her stepbrother... and worse, he falls under her mother's spell. Now dragged into Reinhardt's reckless behavior under the influence of Charm, Connie must once again navigate chaos she never asked for. A comedic-drama Josei where the heroine commands the narrative without being defined by love!",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/all-rounder-maid-connie-wille-volume-2",
            images: [
              "Images/Connie-vol2-std-cover.png",
              "Images/Connie-vol2-std1.png",
              "Images/Connie-vol2-std2.png",
              "Images/Connie-vol2-std3.png",
              "Images/Connie-vol2-std4.png",
              "Images/Connie-vol2-std5.png",
              "Images/Connie-vol2-std6.png",
              "Images/Connie-vol2-std7.png",
              "Images/Connie-vol2-std8.png",
              "Images/Connie-vol2-std9.png",
              "Images/Connie-vol2-std10.png",
              "Images/Connie-vol2-std11.png",
            ],
          },
          limited: {
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/all-rounder-maid-connie-wille-volume-2-limited-edition-with-shikishi",
            images: [
              "Images/Connie-vol2-ltd-cover.png",
              "Images/Connie-vol2-ltd1.png",
              "Images/Connie-vol2-ltd2.png",
              "Images/Connie-vol2-ltd3.png",
              "Images/Connie-vol2-ltd4.png",
              "Images/Connie-vol2-ltd5.png",
              "Images/Connie-vol2-ltd6.png",
              "Images/Connie-vol2-ltd7.png",
              "Images/Connie-vol2-ltd8.png",
              "Images/Connie-vol2-ltd9.png",
              "Images/Connie-vol2-ltd10.png",
              "Images/Connie-vol2-ltd11.png",
            ],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search?query=all-rounder%20maid%20connie%20wille&filters[series]=All-Rounder%20Maid%20Connie%20Wille",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/search?q=all+rounder+maid+connie&page=1&filters%5Bprice%5D=15-25&filters%5BBISACBindingTypeID%5D=Paperback",
          available: true,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: "https://www.waterstones.com/books/search/term/all+rounder+maid+connie",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/libros/search?q=All-rounder+maid+connie",
          available: true,
        },
      ],
    },
  },

  archduke: {
    name: "The Archduke's Adopted Saint",
    volumes: {
      1: {
        label: "Volume 1",
        release: "May 26, 2026",
        pages: 362,
        synopsis:
          "After fourteen lifetimes marked by betrayal and torment at the hands of her dearest friend Lavienne, Saint Dinah prays for an end to her suffering - but the curse of endless reincarnation denies her peace. In her fifteenth life, she seeks death at the hands of the feared Archduke Tersia, only for him to spare her and take her in as his adopted daughter, Esther. Now reborn into the empire's most powerful family, Esther resolves to expose Lavienne's true nature and break the cycle of despair once and for all. A sweeping full-color fantasy of revenge, redemption, and rebirth - making its global print debut in English.",
        editions: {
          standard: {
            price: "$18.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-archdukes-adopted-saint-vol-1",
            images: [
              "Images/Taas-vol1-std-cover.png",
              "Images/TAAS-vol1-std1.png",
              "Images/TAAS-vol1-std2.png",
              "Images/TAAS-vol1-std3.png",
              "Images/TAAS-vol1-std4.png",
              "Images/TAAS-vol1-std5.png",
              "Images/TAAS-vol1-std6.png",
              "Images/TAAS-vol1-std7.png",
              "Images/TAAS-vol1-std8.png",
              "Images/TAAS-vol1-std9.png",
              "Images/TAAS-vol1-std10.png",
              "Images/TAAS-vol1-std11.png",
              "Images/TAAS-vol1-std12.png",
              "Images/TAAS-vol1-std13.png",
              "Images/TAAS-vol1-std14.png",
            ],
          },
          limited: {
            price: "$20.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-archdukes-adopted-saint-vol-1-limited-edition-with-book-mark",
            images: [
              "Images/Taas-vol1-ltd-cover.png",
              "Images/TAAS-vol1-ltd1.png",
              "Images/TAAS-vol1-ltd2.png",
              "Images/TAAS-vol1-ltd3.png",
              "Images/TAAS-vol1-ltd4.png",
              "Images/TAAS-vol1-ltd5.png",
              "Images/TAAS-vol1-ltd6.png",
              "Images/TAAS-vol1-ltd7.png",
              "Images/TAAS-vol1-ltd8.png",
              "Images/TAAS-vol1-ltd9.png",
              "Images/TAAS-vol1-ltd10.png",
              "Images/TAAS-vol1-ltd11.png",
              "Images/TAAS-vol1-ltd12.png",
              "Images/TAAS-vol1-ltd13.png",
              "Images/TAAS-vol1-ltd14.png",
            ],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "December 01, 2026",
        pages: "315 (tentative)",
        synopsis:
          "Just as Esther begins to find her footing within House Tersia, the fragile calm breaks. Her saintly powers awaken earlier than ever before, drawing attention she was never meant to receive so soon. Yet for the first time, her life is not ruled by fear alone. She begins to discover things she loves, and more importantly, people who choose to love her in return. Then a divine prophecy is revealed, binding her fate to forces far beyond her control. And at its center stands a presence she knows all too well - the boy who once lived only in her dreams, now standing before her.",
        editions: {
          standard: {
            price: "$18.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-archdukes-adopted-saint-vol-2",
            images: [
              "Images/Taas-vol2-std-cover.png",
              "Images/TAAS-vol2-std1.png",
              "Images/TAAS-vol2-std2.png",
              "Images/TAAS-vol2-std3.png",
              "Images/TAAS-vol2-std4.png",
              "Images/TAAS-vol2-std5.png",
              "Images/TAAS-vol2-std6.png",
              "Images/TAAS-vol2-std7.png",
              "Images/TAAS-vol2-std8.png",
              "Images/TAAS-vol2-std9.png",
              "Images/TAAS-vol2-std10.png",
              "Images/TAAS-vol2-std11.png",
              "Images/TAAS-vol2-std12.png",
              "Images/TAAS-vol2-std13.png",
              "Images/TAAS-vol2-std14.png",
            ],
          },
          limited: {
            price: "$20.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/thearchdukesadoptedsaint-vol2-limitededition-with-bookmark-of-archduke",
            images: [
              "Images/Taas-vol2-ltd-cover.png",
              "Images/TAAS-vol2-ltd1.png",
              "Images/TAAS-vol2-ltd2.png",
              "Images/TAAS-vol2-ltd3.png",
              "Images/TAAS-vol2-ltd4.png",
              "Images/TAAS-vol2-ltd5.png",
              "Images/TAAS-vol2-ltd6.png",
              "Images/TAAS-vol2-ltd7.png",
              "Images/TAAS-vol2-ltd8.png",
              "Images/TAAS-vol2-ltd9.png",
              "Images/TAAS-vol2-ltd10.png",
              "Images/TAAS-vol2-ltd11.png",
              "Images/TAAS-vol2-ltd12.png",
              "Images/TAAS-vol2-ltd13.png",
              "Images/TAAS-vol2-ltd14.png",
            ],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search2?query=THE+ARCHDUKE%27S+ADOPTED+SAINT",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/?lang=null&q=the+archduke%27s+adopted+saint&search-button=",
          available: true,
        },
        {
          name: "Pen & Sword (UK)",
          icon: "ti-building-store",
          url: "https://www.pen-and-sword.co.uk/The-Archdukes-Adopted-Saint-Volume-1-Paperback/p/57482",
          available: true,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: "https://www.waterstones.com/book/the-archdukes-adopted-saint-volume-1/bino-hwang/bino-hwang/9788198763617",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/books/search?q=ARCHDUKE%27S+ADOPTED+SAINT",
          available: true,
        },
      ],
    },
  },

  baroness: {
    name: "Baroness Goes on Strike",
    format: "A5 Paperback",
    volumes: {
      1: {
        label: "Volume 1",
        release: "January 13, 2026",
        pages: 376,
        synopsis:
          "Although Baroness Cassia is on her deathbed, she's relieved that it means she's finally free from her loveless marriage to her mercenary husband, Zester. Oh, how she regrets her tireless efforts to keep his territory afloat! If only she had taken more time for herself. Her wish becomes reality when Cassia wakes up to find herself ten years back in the past. With this second chance, she's determined to live a stress-free life. But can Cassia find the courage to rebel against Zester? Or is she doomed to repeat her nightmare of a past life?",
        editions: {
          standard: {
            price: "$20.00",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/baroness-goes-on-strike-vol-1",
            images: [
              "Images/BGOS-vol1-std-cover.png",
              "Images/BGOS-vol1-std1.png",
              "Images/BGOS-vol1-std2.png",
              "Images/BGOS-vol1-std3.png",
              "Images/BGOS-vol1-std4.png",
              "Images/BGOS-vol1-std5.png",
              "Images/BGOS-vol1-std6.png",
              "Images/BGOS-vol1-std7.png",
              "Images/BGOS-vol1-std8.png",
              "Images/BGOS-vol1-std9.png",
              "Images/BGOS-vol1-std10.png",
              "Images/BGOS-vol1-std11.png",
              "Images/BGOS-vol1-std12.png",
              "Images/BGOS-vol1-std13.png",
            ],
          },
          limited: {
            price: "$20.00",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/baroness-goes-on-strike-vol-1-limited-edition-with-photocard-and-special-pop-up-card",
            images: [
              "Images/BGOS-vol1-ltd-cover.png",
              "Images/BGOS-vol1-ltd1.png",
              "Images/BGOS-vol1-ltd2.png",
              "Images/BGOS-vol1-ltd3.png",
              "Images/BGOS-vol1-ltd4.png",
              "Images/BGOS-vol1-ltd5.png",
              "Images/BGOS-vol1-ltd6.png",
              "Images/BGOS-vol1-ltd7.png",
              "Images/BGOS-vol1-ltd8.png",
              "Images/BGOS-vol1-ltd9.png",
              "Images/BGOS-vol1-ltd10.png",
              "Images/BGOS-vol1-ltd11.png",
              "Images/BGOS-vol1-ltd12.png",
              "Images/BGOS-vol1-ltd13.png",
            ],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "May 12, 2026",
        pages: 298,
        synopsis:
          "Cassia vowed this life would be stress-free - no wars, no politics, and definitely no chasing after her husband. But when Zester marches off to Viscount Viche's territorial war, Cassia has no choice but to follow... But Viche's ploys are dirtier than expected, and Cassia soon finds herself entangled in power plays, backroom deals, and a husband far too naïve for his own good. And just when she thinks she's got the upper hand, Zester starts to act different - gentler, warmer... dangerously close to the man she once wished he could be. One misstep, and Cassia won't just risk her hard-won peace - she might lose herself to him all over again.",
        editions: {
          standard: {
            price: "$22.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/baroness-goes-on-strike-vol-2",
            images: [
              "Images/BGOS-vol2-std-cover.png",
              "Images/BGOS-vol2-std1.png",
              "Images/BGOS-vol2-std2.png",
              "Images/BGOS-vol2-std3.png",
              "Images/BGOS-vol2-std4.png",
              "Images/BGOS-vol2-std5.png",
              "Images/BGOS-vol2-std6.png",
              "Images/BGOS-vol2-std7.png",
              "Images/BGOS-vol2-std8.png",
              "Images/BGOS-vol2-std9.png",
              "Images/BGOS-vol2-std10.png",
              "Images/BGOS-vol2-std11.png",
              "Images/BGOS-vol2-std12.png",
              "Images/BGOS-vol2-std13.png",
            ],
          },
          limited: {
            price: "$24.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/baroness-goes-on-strike-vol-2-limited-edition-with-photocard",
            images: [
              "Images/BGOS-vol2-ltd-cover.png",
              "Images/BGOS-vol2-ltd1.png",
              "Images/BGOS-vol2-ltd2.png",
              "Images/BGOS-vol2-ltd3.png",
              "Images/BGOS-vol2-ltd4.png",
              "Images/BGOS-vol2-ltd5.png",
              "Images/BGOS-vol2-ltd6.png",
              "Images/BGOS-vol2-ltd7.png",
              "Images/BGOS-vol2-ltd8.png",
              "Images/BGOS-vol2-ltd9.png",
              "Images/BGOS-vol2-ltd10.png",
              "Images/BGOS-vol2-ltd11.png",
              "Images/BGOS-vol2-ltd12.png",
              "Images/BGOS-vol2-ltd13.png",
            ],
          },
        },
      },
      3: {
        label: "Volume 3",
        release: "Decemeber 15, 2026",
        pages: "263 (tentative)",
        synopsis:
          "From one territorial dispute to the next, Cassia knows the pattern too well. Another war looms, and with it the certainty that Zester will once again leave for battle to keep Greze afloat. Yet fate has shifted its footing. Caught between unease and resolve, Cassia reaches out to the family she once cut ties with in her previous life, beginning with a father she long believed cold. In doing so, she returns to Ruberno alongside Zester for the first time in years. The city welcomes her warmly, and for a fleeting moment, everything seems to fall into place. Except for Zester. To the Rubernos, he is unworthy of standing beside a woman so clearly above his station. Their quiet disdain hardens into trials, each one demanding that Zester prove the sincerity of his devotion in ways neither of them anticipated. And as prosperity begins to bloom, the shadows of Cassia's past stir once more. Will this fragile happiness endure, or will the tides turn again?",
        editions: {
          standard: {
            price: "$22.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/baroness-goes-on-strike-vol-3",
            images: ["Images/BGOS VOL 3 Cover.png"],
          },
          limited: {
            price: "$24.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/baroness-goes-on-strike-vol-3--limited-edition-with-bookmark-of-cassia",
            images: ["Images/BGOS VOL3 LIMITED EDITION.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search2?query=baroness+goes+on+strike",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/?lang=null&q=from+a+knight+to+a+aldy&search-button=",
          available: true,
        },
        {
          name: "Pen & Sword (UK)",
          icon: "ti-building-store",
          url: "https://www.pen-and-sword.co.uk/cookies",
          available: true,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: "https://www.waterstones.com/books/search/term/baroness+goes+on+strike",
          available: true,
        },
        {
          name: "Dymocks (Australia)",
          icon: "ti-building-store",
          url: "https://www.dymocks.com.au/catalogsearch/result/?q=baroness+goes+on+strike+",
          available: true,
        },
        {
          name: "Mighty Ape (Australia)",
          icon: "ti-building-store",
          url: "https://www.mightyape.com.au/ma/shop/?q=baroness+goes+on+strike+",
          available: true,
        },
        {
          name: "QBD Books (Australia)",
          icon: "ti-building-store",
          url: "https://www.qbd.com.au/baroness-goes-on-strike-volume-1/song-yeseul/9788198763624/",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/books/search?q=BARONESS+GOES+ON+STRIKE",
          available: true,
        },
      ],
    },
  },

  darling: {
    name: "Darling, Why Don't We Divorce?",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 01, 2026",
        pages: "340 (tentative)",
        synopsis:
          "When Ophelia Lizen awakens in the body of a doomed villainess fated to murder her husband, she wants only one thing — a divorce. Sent back before the tragedy unfolds, she plans to end her marriage quietly and vanish from the capital. But rumors brand her as the crown prince's obsessive stalker, and her cold, calculating husband, Duke Sylvester Lizen, refuses to let her go. Now trapped between a prince who despises her and a husband who won't release her, Ophelia's only way out may be through the very game she swore to avoid. A slow-burn romantic fantasy about a villainous couple bound by fate, torn by pride, and far too stubborn to realize they might just be in love.",
        editions: {
          standard: {
            price: "$20.00",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/darling-why-dont-we-divorce-vol-1",
            images: [
              "Images/DWD-vol1-std-cover.png",
              "Images/DWD-vol1-std1.png",
              "Images/DWD-vol1-std2.png",
              "Images/DWD-vol1-std3.png",
              "Images/DWD-vol1-std4.png",
              "Images/DWD-vol1-std5.png",
              "Images/DWD-vol1-std6.png",
              "Images/DWD-vol1-std7.png",
              "Images/DWD-vol1-std8.png",
              "Images/DWD-vol1-std9.png",
              "Images/DWD-vol1-std10.png",
              "Images/DWD-vol1-std11.png",
              "Images/DWD-vol1-std12.png",
              "Images/DWD-vol1-std13.png",
            ],
          },
          limited: {
            price: "$24.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/darling-why-dont-we-divorce-vol-1-limited-edition-with-pop-up-card",
            images: [
              "Images/DWD-vol1-ltd-cover.png",
              "Images/DWD-vol1-ltd1.png",
              "Images/DWD-vol1-ltd2.png",
              "Images/DWD-vol1-ltd3.png",
              "Images/DWD-vol1-ltd4.png",
              "Images/DWD-vol1-ltd5.png",
              "Images/DWD-vol1-ltd6.png",
              "Images/DWD-vol1-ltd7.png",
              "Images/DWD-vol1-ltd8.png",
              "Images/DWD-vol1-ltd9.png",
              "Images/DWD-vol1-ltd10.png",
              "Images/DWD-vol1-ltd11.png",
              "Images/DWD-vol1-ltd12.png",
              "Images/DWD-vol1-ltd13.png",
            ],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "December 15, 2026",
        pages: "340 (tentative)",
        synopsis:
          "Duchess Ophelia Lizen makes a calculated decision: before she divorces her husband, she will cleanse her name. Returning to high society with deliberate poise, she sets her sights on one objective — win the public, secure allies, build a foundation strong enough to stand without Duke Sylvester Lizen's protection. Yet nothing unfolds as neatly as planned. As Ophelia works to soften the icy disdain of Crown Prince Calian and outmaneuver her sharp-tongued rival, Countess Fleur, the court proves merciless. When she is framed for scandals that mirror the sins of her former self, no one steps forward to defend her — no one but her husband. The more he shields her, the more difficult it becomes to escape his grasp. A slow-burn romantic fantasy about a villainous couple bound by fate, divided by pride, and far too stubborn to admit they might already be in love.",
        editions: {
          standard: {
            price: "$22.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/darling-why-dont-we-divorce-vol-2",
            images: [
              "Images/DWD-vol2-std-cover.png",
              "Images/DWD-vol2-std1.png",
              "Images/DWD-vol2-std2.png",
              "Images/DWD-vol2-std3.png",
              "Images/DWD-vol2-sd4.png",
              "Images/DWD-vol2-std5.png",
              "Images/DWD-vol2-std6.png",
              "Images/DWD-vol2-sltd7.png",
              "Images/DWD-vol2-std8.png",
              "Images/DWD-vol2-std9.png",
              "Images/DWD-vol2-std10.png",
              "Images/DWD-vol2-std11.png",
              "Images/DWD-vol2-std12.png",
              "Images/DWD-vol2-std13.png",
            ],
          },
          limited: {
            price: "$24.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/darling-why-dont-we-divorce-volume-2-limited-edition-with-bookmark-of-duke-sylvester-lizen",
            images: [
              "Images/DWD-vol2-ltd-cover.png",
              "Images/DWD-vol2-ltd1.png",
              "Images/DWD-vol2-ltd2.png",
              "Images/DWD-vol2-ltd3.png",
              "Images/DWD-vol2-ltd4.png",
              "Images/DWD-vol2-ltd5.png",
              "Images/DWD-vol2-ltd6.png",
              "Images/DWD-vol2-ltd7.png",
              "Images/DWD-vol2-ltd8.png",
              "Images/DWD-vol2-ltd9.png",
              "Images/DWD-vol2-ltd10.png",
              "Images/DWD-vol2-ltd11.png",
              "Images/DWD-vol2-ltd12.png",
              "Images/DWD-vol2-ltd13.png",
            ],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search?query=Darling%2C%20Why%20Don%27t%20We%20Divorce%3F&filters[authors]=Studio%20Inus",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/pages/contributor/studio-inus?id=900114275",
          available: true,
        },
        {
          name: "Pen & Sword (UK)",
          icon: "ti-building-store",
          url: "https://www.pen-and-sword.co.uk/Darling-Why-Dont-We-Divorce-Volume-1-Paperback/p/58420",
          available: true,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: "https://www.waterstones.com/books/search/term/darling+why+dont+we+divorce",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/books/search?q=Darling%2C+why+don%27t+we+divorce",
          available: true,
        },
      ],
    },
  },

  grenimal: {
    name: "The Executioner of Grenimal",
    volumes: {
      1: {
        label: "Volume 1",
        release: "October 13, 2026",
        pages: 168,
        synopsis:
          "Humanity trembles before the Grenimals — grotesque creatures born from corrupted desire. Among them roam the Lycanthropes, savage beasts driven by their lust for chaos, and the Vampires, who see humans as nothing more than cattle. As the world teeters on the brink of madness, the Executioners rise to stand against the encroaching darkness. Among their ranks are Mutuki, a stoic battle-hardened warrior, and his sharp-witted partner Yuri, as they plunge into one supernatural mystery after another — each case more twisted than the last, each unveiling horrors festering in the shadows of their crumbling world. A dark action fantasy of mystery, survival, and vengeance begins — where the line between hunter and hunted begins to blur.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-executioner-of-grenimal",
            images: [
              "Images/Grenimal-vol 1.png",
              "Images/Grenimal-vol1-std1.png",
              "Images/Grenimal-vol1-std2.png",
              "Images/Grenimal-vol1-std3.png",
              "Images/Grenimal-vol1-std4.png",
              "Images/Grenimal-vol1-std5.png",
              "Images/Grenimal-vol1-std6.png",
              "Images/Grenimal-vol1-std7.png",
              "Images/Grenimal-vol1-std8.png",
              "Images/Grenimal-vol1-std9.png",
              "Images/Grenimal-vol1-std10.png",
              "Images/Grenimal-vol1-std11.png",
            ],
          },
          limited: {
            price: "$15.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-executioner-of-grenimal-vol1--limited-edition-with-shikishi",
            images: [
              "Images/Grenimal-vol1-ltd-cover.png",
              "Images/Grenimal-vol1-ltd1.png",
              "Images/Grenimal-vol1-ltd2.png",
              "Images/Grenimal-vol1-ltd3.png",
              "Images/Grenimal-vol1-ltd4.png",
              "Images/Grenimal-vol1-ltd5.png",
              "Images/Grenimal-vol1-ltd6.png",
              "Images/Grenimal-vol1-ltd7.png",
              "Images/Grenimal-vol1-ltd8.png",
              "Images/Grenimal-vol1-ltd9.png",
              "Images/Grenimal-vol1-ltd10.png",
              "Images/Grenimal-vol1-ltd11.png",
            ],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "December 01, 2026",
        pages: 186,
        synopsis:
          "Standing between civilization and annihilation are the Executioners — humanity's last defense against the Grenimals. Mutuki and Yuri are dispatched on a new mission: infiltrate a clandestine underground auction steeped in danger and secrecy. But what begins as covert reconnaissance soon unravels something far more sinister. As the pair descend deeper into the auction's labyrinth of secrets, they uncover a conspiracy that threatens to tip the fragile balance of power. A dark, action-packed tale of blood, betrayal, and the Executioners who walk the line between justice and damnation — where justice is bought, loyalty is tested, and survival demands more than steel and silver.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-executioner-of-grenimal-vol2",
            images: [
              "Images/Grenimal-vol 2.png",
              "Images/Grenimal-vol2-std1.png",
              "Images/Grenimal-vol2-std2.png",
              "Images/Grenimal-vol2-std3.png",
              "Images/Grenimal-vol2-std4.png",
              "Images/Grenimal-vol2-std5.png",
              "Images/Grenimal-vol2-std6.png",
              "Images/Grenimal-vol2-std7.png",
              "Images/Grenimal-vol2-std8.png",
              "Images/Grenimal-vol2-std9.png",
              "Images/Grenimal-vol2-std10.png",
              "Images/Grenimal-vol2-std11.png",
            ],
          },
          limited: {
            price: "$15.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-executioner-of-grenimal-vol2--limited-edition-with-shikishi",
            images: [
              "Images/Grenimal-vol2-ltd-cover.png",
              "Images/Grenimal-vol2-ltd1.png",
              "Images/Grenimal-vol2-ltd2.png",
              "Images/Grenimal-vol2-ltd3.png",
              "Images/Grenimal-vol2-ltd4.png",
              "Images/Grenimal-vol2-ltd5.png",
              "Images/Grenimal-vol2-ltd6.png",
              "Images/Grenimal-vol2-ltd7.png",
              "Images/Grenimal-vol2-ltd8.png",
              "Images/Grenimal-vol2-ltd9.png",
              "Images/Grenimal-vol2-ltd10.png",
              "Images/Grenimal-vol2-ltd11.png",
            ],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
        {
          name: "Manga Plaza",
          icon: "ti-device-tablet",
          url: "https://mangaplaza.com/title/0303012780/",
          available: true,
        },
        {
          name: "Book Walker",
          icon: "ti-device-tablet",
          url: "https://bookwalker.com/series/1NYYJ2T85980/the-executioner-of-grenimal",
          available: true,
        },
      ],
      print: [
        {
          name: "Barnes & Noble (US)",
          icon: "ti-building-store",
          url: "https://www.barnesandnoble.com/search?q=executioner%20of%20grenimal",
          available: true,
        },
        {
          name: "Books-A-Million US)",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search?query=The%20Executioner%20of%20Grenimal&filters[authors]=Akisuke",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/pages/contributor/akisuke?id=900163717",
          available: true,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: "https://www.waterstones.com/books/search/term/the+executioner+of+grenimal",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/libros/search?q=Executioner+of+Grenimal",
          available: true,
        },
      ],
    },
  },

  fktl: {
    name: "From a Knight to a Lady",
    volumes: {
      1: {
        label: "Volume 1",
        release: "February 24, 2026",
        pages: 378,
        synopsis:
          "Estelle meets her untimely death as a valiant knight of the Kingdom of Ersha. But death is not the end for Estelle - three years after her demise, she finds herself reincarnated in the body of Lucifela Aydin, the spoiled and cold-hearted daughter of a count in the Empire of Jansgar. To her dismay, she finds that her country fell to Jansgar years ago, and that she is now betrothed to Zedekiah Heint, the son of a duke and her adversary in her previous life. Can Estelle discover the truth behind her death while attempting to navigate her new life as Lucifela?",
        editions: {
          standard: {
            price: "$20.00",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/from-a-knight-to-a-lady-vol-1",
            images: [
              "Images/FKTL-vol1-std-cover.png",
              "Images/FKTL-vol1-std1.png",
              "Images/FKTL-vol1-std2.png",
              "Images/FKTL-vol1-std3.png",
              "Images/FKTL-vol1-std4.png",
              "Images/FKTL-vol1-std5.png",
              "Images/FKTL-vol1-std6.png",
              "Images/FKTL-vol1-std7.png",
              "Images/FKTL-vol1-std8.png",
              "Images/FKTL-vol1-std9.png",
              "Images/FKTL-vol1-std10.png",
              "Images/FKTL-vol1-std11.png",
              "Images/FKTL-vol1-std12.png",
              "Images/FKTL-vol1-std13.png",
            ],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "May 26, 2026",
        pages: 342,
        synopsis:
          "Whispers of madness trail Lucifela, branding her as unstable while she wrestles with a past that refuses to release its hold. Yet beneath the slander lies a more harrowing truth - her sworn enemy, Khalid, lives on under a new name: Duke Louis Luke of Jansgar. Driven by vengeance, Lucifela steels her will to reclaim her strength and wield her power against those who wronged her. But the palace is a nest of vipers - the princes plot in the shadows, the Crown Prince preys upon the weak, and betrayal lurks behind every courteous smile. Just when Lucifela begins to stand as the true daughter of House Aydin, a cruel trap is ignited in the mountains. Hunted, surrounded, and with only fleeting allies by her side… will she get away, or fall into the hands of those who covet her life?",
        editions: {
          standard: {
            price: "$22.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/from-a-knight-to-a-lady-vol-2",
            images: [
              "Images/FKTL-vol2-std-cover.png",
              "Images/FKTL-vol2-std1.png",
              "Images/FKTL-vol2-std2.png",
              "Images/FKTL-vol2-std3.png",
              "Images/FKTL-vol2-std4.png",
              "Images/FKTL-vol2-std5.png",
              "Images/FKTL-vol2-std6.png",
              "Images/FKTL-vol2-std7.png",
              "Images/FKTL-vol2-std8.png",
              "Images/FKTL-vol2-std9.png",
              "Images/FKTL-vol2-std10.png",
              "Images/FKTL-vol2-std11.png",
              "Images/FKTL-vol2-std12.png",
              "Images/FKTL-vol2-std13.png",
            ],
          },
          limited: {
            price: "$24.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/from-a-knight-to-a-lady-vol-2-limited-edition-with-photocard-set",
            images: [
              "Images/FKTL-vol2-ltd-cover.png",
              "Images/FKTL-vol2-ltd1.png",
              "Images/FKTL-vol2-ltd2.png",
              "Images/FKTL-vol2-ltd3.png",
              "Images/FKTL-vol2-ltd4.png",
              "Images/FKTL-vol2-ltd5.png",
              "Images/FKTL-vol2-ltd6.png",
              "Images/FKTL-vol2-ltd7.png",
              "Images/FKTL-vol2-ltd8.png",
              "Images/FKTL-vol2-ltd9.png",
              "Images/FKTL-vol2-ltd10.png",
              "Images/FKTL-vol2-ltd11.png",
              "Images/FKTL-vol2-ltd12.png",
              "Images/FKTL-vol2-ltd13.png",
            ],
          },
        },
      },
      3: {
        label: "Volume 3",
        release: "January 12, 2027",
        pages: "332 (tentative)",
        synopsis:
          "Survival has a price, and Lucifela is forced to pay it. Pulled from the jaws of death in the mountains, Lucifela returns to House Aydin with more than scars. The traitor who once ended Estelle's life stands exposed at last, yet Khalid Louis Luke remains beyond her grasp - alive, unrepentant, and disturbingly amused by the honor he shattered. Though Lucifela forces him away from her path, his shadow lingers, tangled with Ersha's secrets and a past that refuses to stay buried. As the Crown Prince's schemes are laid bare, his rage festers and the capital turns its gaze on Lucifela. Under unrelenting scrutiny and mounting misunderstandings, Zedekiah's concern sharpens into suspicion as he questions Lucifela's ties to the Crown Prince. Jealousy takes root, doubt deepens, and a truth neither of them dares voice begins to surface. Dragged into the venomous elegance of noble society, Lucifela learns that survival alone is no longer enough. The game has changed. Lucifela will no longer merely endure fate - she will prepare to challenge it.",
        editions: {
          standard: {
            price: "$22.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/from-a-knight-to-a-lady-vol-3",
            images: [
              "Images/FKTL-vol3-std-cover.png",
              "Images/FKTL-vol3-std1.png",
              "Images/FKTL-vol3-std2.png",
              "Images/FKTL-vol3-std3.png",
              "Images/FKTL-vol3-std4.png",
              "Images/FKTL-vol3-std5.png",
              "Images/FKTL-vol3-std6.png",
              "Images/FKTL-vol3-std7.png",
              "Images/FKTL-vol3-std8.png",
              "Images/FKTL-vol3-std9.png",
              "Images/FKTL-vol3-std10.png",
              "Images/FKTL-vol3-std11.png",
              "Images/FKTL-vol3-std12.png",
              "Images/FKTL-vol3-std13.png",
            ],
          },
          limited: {
            price: "$24.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/from-a-knight-to-a-lady-volume-3-limited-edition-with-postcard-and-sticker-set",
            images: [
              "Images/FKTL-vol3-ltd-cover.png",
              "Images/FKTL-vol3-ltd1.png",
              "Images/FKTL-vol3-ltd2.png",
              "Images/FKTL-vol3-ltd3.png",
              "Images/FKTL-vol3-ltd4.png",
              "Images/FKTL-vol3-ltd5.png",
              "Images/FKTL-vol3-ltd6.png",
              "Images/FKTL-vol3-ltd7.png",
              "Images/FKTL-vol3-ltd8.png",
              "Images/FKTL-vol3-ltd9.png",
              "Images/FKTL-vol3-ltd10.png",
              "Images/FKTL-vol3-ltd11.png",
              "Images/FKTL-vol3-ltd12.png",
              "Images/FKTL-vol3-ltd13.png",
            ],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search2?query=from+a+knight+to+a+lady",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/?lang=null&q=from+a+knight+to+a+aldy&search-button=",
          available: true,
        },
        {
          name: "Pen & Sword (UK)",
          icon: "ti-building-store",
          url: "https://www.pen-and-sword.co.uk/From-a-Knight-to-a-Lady-Volume-1-Paperback/p/57390",
          available: true,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: "https://www.waterstones.com/book/from-a-knight-to-a-lady-volume-1/ink/ein/9788198763686",
          available: true,
        },
        {
          name: "Dymocks (Australia)",
          icon: "ti-building-store",
          url: "https://www.dymocks.com.au/from-a-knight-to-a-lady-volume-1-by-ink-9788198763686",
          available: true,
        },
        {
          name: "Mighty Ape (Australia)",
          icon: "ti-building-store",
          url: "https://www.mightyape.com.au/ma/buy/kogan-international-from-a-knight-to-a-lady-volume-1-40937393/",
          available: true,
        },
        {
          name: "QBD Books (Australia)",
          icon: "ti-building-store",
          url: "https://www.qbd.com.au/from-a-knight-to-a-lady-volume-1/ink/9788198763686/",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/books/search?q=From+a+Knight+to+a+Lady&fe%5B0%5D=crossed+hearts",
          available: true,
        },
      ],
    },
  },

  matchmaker: {
    name: "The Matchmaker's Fiancé",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 01, 2026",
        pages: 201,
        synopsis:
          "After ten long years of engagement to Gilbert Norman, heir to a ducal house, Seara Elliot, daughter of a humble viscount, finally makes up her mind—it's time to call it off! Though her heart still belongs to Gilbert, his distant attitude toward her and the gentle smiles he offers to other women have convinced Seara that she's not the one he wants. If setting him free means his happiness, then so be it. Rather than cling to a hopeless love, Seara decides to let him go with grace. But to her astonishment, Gilbert refuses! Completely bewildered, Seara begins to question everything: his intentions, his feelings, and the truth behind his cold facade. Determined to secure his happiness one way or another, she sets out on a mission: to find and recommend the perfect bride to take her place… even if her heart hasn't quite caught up with the idea yet. A spirited viscount's daughter, a prideful duke's heir, and a misguided engagement that simply refuses to end—a sweet, slow-burn romantic comedy where love begins only after the break-up!",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-matchmakers-fiance-vol-1",
            images: [
              "Images/Matchmaker-vol1-std-cover.png",
              "Images/Matchmaker-vol1-std1.png",
              "Images/Matchmaker-vol1-std2.png",
              "Images/Matchmaker-vol1-std3.png",
              "Images/Matchmaker-vol1-std4.png",
              "Images/Matchmaker-vol1-std5.png",
              "Images/Matchmaker-vol1-std6.png",
              "Images/Matchmaker-vol1-std7.png",
              "Images/Matchmaker-vol1-std8.png",
              "Images/Matchmaker-vol1-std9.png",
              "Images/Matchmaker-vol1-std10.png",
            ],
          },
          limited: {
            price: "$12.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/the-matchmakers-fiance-vol-1-limited-edition-with-shikishi",
            images: [
              "Images/Matchmaker-vol1-ltd-cover.png",
              "Images/Matchmaker-vol1-ltd1.png",
              "Images/Matchmaker-vol1-ltd2.png",
              "Images/Matchmaker-vol1-ltd3.png",
              "Images/Matchmaker-vol1-ltd4.png",
              "Images/Matchmaker-vol1-ltd5.png",
              "Images/Matchmaker-vol1-ltd6.png",
              "Images/Matchmaker-vol1-ltd7.png",
              "Images/Matchmaker-vol1-ltd8.png",
              "Images/Matchmaker-vol1-ltd9.png",
              "Images/Matchmaker-vol1-ltd10.png",
            ],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search?query=matchmaker%27s%20fiance&filters[authors]=Amamiya%20Satsuki",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/search?q=The+Matchmaker%27s+Fianc%C3%A9%3A+My+Fianc%C3%A9+Won%27t+Leave+Me+Alone",
          available: true,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: "https://www.waterstones.com/books/search/term/the+matchmaker+++s+fianc++",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/libros/search?q=MATCHMAKER%27S+FIANCE",
          available: true,
        },
      ],
    },
  },

  raeliana: {
    name: "Why Raeliana Ended Up At The Duke's Mansion",
    format: "A5 Paperback",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 15, 2026",
        pages: 296,
        synopsis:
          "After being reborn into the world of a novel, Eunha Park refuses to die a second time as Raeliana McMillan, the side character fated to be poisoned by her fiancé. To change her destiny, she strikes a bold deal with the empire's most powerful and unpredictable man, Duke Noah Volstaire Wynknight — the novel's dangerously charming yet ruthlessly calculating male lead. In exchange for keeping his darkest secret, he'll protect her as his temporary fiancée. But life beside the Duke is anything but safe. Beneath his angelic charm lies an icy heart, and each encounter draws her deeper into a world of royal intrigue, dangerous secrets, and a love that teeters between deception and desire. A captivating romance-fantasy about fate, ambition, and the peril of falling for the man who was never meant to be hers.",
        editions: {
          standard: {
            price: "$19.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/why-raeliana-ended-up-at-the-dukes-mansion-vol-1",
            images: ["Images/raelianaVol1-std.jpg"],
          },
          Special: {
            label: "Special",
            price: "$28.00",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/why-raeliana-ended-up-at-the-dukes-mansion-vol-1-special-edition-with-dust-jacket-and-sprayed-edges",
            images: ["Images/raelianaVol1-ltd.jpg"],
          },
        },
      },
      2: {
        label: "Volume 2",
        release: "December 15, 2026",
        pages: 296,
        synopsis:
          "With the whirlwind of incidents behind them and their promised deal fulfilled, Raeliana McMillan believes she is finally free. All she must do is step aside, end the engagement, and return the story to its rightful course. To do so, she must find the novel's true heroine, Beatrice, and guide her to Duke Noah. But when the woman who should appear never shows, everything begins to unravel. In Beatrice's absence, new bonds quietly take root, and Raeliana becomes painfully aware of the hollow ache she feels around Noah. Their engagement was only ever an act — a carefully staged illusion — so why does letting go feel so unbearably heavy? When Raeliana declares their contract over, Noah refuses to let her go. The mystery behind Beatrice's disappearance deepens, drawing her and Noah toward a future neither of them was meant to claim.",
        editions: {
          standard: {
            price: "$19.99",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/why-raeliana-ended-up-at-the-dukes-mansion-vol-2",
            images: ["Images/raelianaVol2-std.jpg"],
          },
          limited: {
            price: "$28.00",
            buyUrl:
              "https://thecrossedhearts.com/shop-all-1/ols/products/why-raeliana-ended-up-at-the-dukes-mansion-vol-2-special-edition-with-dust-jacket-and-sprayed-edges",
            images: ["Images/raelianaVol2-ltd.jpg"],
          },
        },
      },
    },
    boxSet: {
      name: "Raeliana Collector's Box Set (Vol. 1 & 2)",
      price: "$60.00",
      image: "Images/raelianaboxset.jpg",
      buyUrl:
        "https://thecrossedhearts.com/shop-all-1/ols/products/why-raeliana-ended-up-at-the-dukes-mansion-collectors-box-set",
      includes: [
        "Volumes 1 & 2 with exclusive dust jackets and sprayed edges",
        "Premium collector's box with Raeliana-themed artwork and design",
        "Exclusive Raeliana Letter in a themed envelope, written from her POV",
        "Exclusive Couple Poster featuring Raeliana and Noah",
        "Noah Shikishi Art Board",
        "Character Bookmark Set featuring Raeliana and Noah",
        "Character Sticker Set featuring Raeliana and Noah",
      ],
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: "https://www.booksamillion.com/search?query=Why+Raeliana+Ended+Up+at+the+Duke%27s+Mansion+novel",
          available: true,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: "https://www.indigo.ca/search?q=Why+Raeliana+Ended+Up+at+the+Duke%27s+Mansion+novel",
          available: true,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: "https://www.bookdelivery.com/in-en/libros/search?q=Raeliana&fe%5B0%5D=a+novel+press",
          available: true,
        },
      ],
    },
  },

  gaze: {
    name: "A Gaze Like Lightning",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 01, 2026",
        pages: 176,
        synopsis:
          'Hiyori is a pro at staying under the radar, but his latest mission is a total spotlight: find out if the campus heartthrob, Kanemori Ryou, is off the market. It should be a simple "yes" or "no" task during their shared shifts. The catch? Hiyori is secretly, hopelessly in love with Ryou himself. Stuck with a classmate\'s request and a heart that won\'t stop racing, Hiyori starts "investigating"—only to realize that while he\'s been watching Ryou from the shadows, Ryou might have been looking right back all along. Is Hiyori playing matchmaker for a rival, or is he accidentally setting the stage for his own romantic debut?',
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/gaze-std.png"],
          },
          limited: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/gaze-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  thebird: {
    name: "The Bird In The Cage Dreams",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 01, 2026",
        pages: 192,
        synopsis:
          "I cursed you 'to live'-- The Leyveda are a ruthless and belligerent fighting tribe. Tsad, a retired warrior, is secretly confined in a remote village as a comforter. Ziz, the man who comes to Tsad frequently to take care of him, is the eldest son of the family with ancestral blood and the man closest to becoming the next chief of the tribe. Ziz tries to rescue Tsad, who once fought with him as his right hand man, from the cage by becoming the head of the family...?",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/thebird-std.png"],
          },
          limited: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/thebird-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  theking: {
    name: "The King Of Owls And His Troubled Servant",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 01, 2026",
        pages: 176,
        synopsis:
          '"Even though we are childhood friends—even though I am your servant—I want to be your mate." In the frigid Northern Reach of the Underworld, Madara rules as the King of the Bird Tribe. But a throne without an heir is a kingdom in shadow, and Madara remains stubbornly without a mate. Sasou, his most loyal guard and childhood companion, has spent a lifetime scolding the King\'s recklessness while burying his own heart. But when a single night of aphrodisiac-fueled passion shatters the boundary between master and servant, the silence between them is broken. Madara is no longer looking for a Queen—he is looking for Sasou.',
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/theking-std.png"],
          },
          limited: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/theking-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  until: {
    name: "Until We Fall In Love",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 01, 2026",
        pages: 176,
        synopsis:
          "\"I don't believe in fated love.\" To his classmates, Aito is just another high schooler. In reality, he's a Cupid, capable of seeing the vibrant \"shape of love\" in everyone around him—even if he's never felt its pulse himself. That changes the moment he meets Kokowa. Popular, athletic, and impossibly charming, Kokowa's heart burns with a relentless, brilliant red light that Aito can't ignore. Despite his best efforts to stay detached, Aito finds himself drawn to a heat he was never meant to feel. But for a Cupid, there is one absolute law: Never fall for a human.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/until-std.png"],
          },
          limited: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/until-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },
  lovebeyond: {
    name: "Love Beyond the Final Boss: The Hero Party's Quest for Love",
    volumes: {
      1: {
        label: "Volume 1",
        release: "February 16, 2027",
        ////pages: "TBD",
        synopsis:
          "Buildings crumble. Chaos erupts in the streets. And in the middle of it all, the strongest hero throws himself into the line of fire bracing an attack meant for someone else, close enough to feel their heartbeat. Some heroes fight for glory. This one keeps ending up in someone's arms instead. The world has already been saved... perhaps a little too well. Thanks to the strongest Hero Party in history, not only has the Demon King been defeated, but wars have ended, racial conflicts have vanished, cities have made peace, medicine has advanced, education has flourished... and just about every problem imaginable has already been solved. Unfortunately, that leaves one group with nothing left to do: the other heroes summoned from another world. Robbed of their destiny, these aimless heroes have gone completely off the rails. Strongest Hero, please save the world... from its own saviors!",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Love beyond the final boss.jpeg"],
          },
          limited: {
            price: "$15.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/lovebeyond-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  mobs: {
    name: "Two of Us Can't Stay Mobs!",
    volumes: {
      1: {
        label: "Volume 1",
        release: "February 16, 2027",
        ////pages: "TBD",
        synopsis:
          "All they want is to be forgettable. The universe has other plans. Every time they try to fade into the crowd, fate drags them right back into the spotlight together. Himejima is the school's impossibly handsome heartthrob. Onimaru is a striking beauty with the unmistakable presence of an oni. They share one simple dream: to be completely ordinary. No attention. No popularity. No standing out. There's just one problem. When you're this unforgettable... being a mob is impossible.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Mobs Updated Cover Page.png"],
          },
          limited: {
            price: "$15.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/mobs-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  emma: {
    name: "Emma and the Eyes That Bid Farewell",
    volumes: {
      1: {
        label: "Volume 1",
        release: "February 16, 2027",
        ////pages: "TBD",
        synopsis:
          "A girl who can't use magic. A partner who never wanted her. And a killer who's already chosen their target. Emma has dreamed of attending the prestigious Royal Academy of Magic her entire life. There's just one problem. She can't use magic. On the day of the entrance ceremony, Emma's dreams seem destined to shatter... until a chance encounter with the aloof and sharp-tongued Phyllis changes everything. But surviving academy life soon becomes the least of Emma's concerns as a deadly conspiracy begins to unfold.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/emma and the eyes cover page.png"],
          },
          limited: {
            price: "$15.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/emma-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  inksoaked: {
    name: "Ink Soaked into Ashen Paper",
    format: "A5 Paperback",
    volumes: {
      1: {
        label: "Volume 1",
        release: "March 16, 2027",
        ////pages: "TBD",
        synopsis:
          "The Empress demanded the Crown Prince as tribute. She received a princess... and together, they rewrote history. As the price of peace, Queen Karmi van Vierna, the Iron-Crowned Queen, demands a royal spouse from the defeated empire: the Emperor's own Crown Prince. But the Daehyeon Empire has no heir to offer. Instead, Princess Seo Hwahwi is sent in his place, becoming the first princess in history to enter a royal same-sex marriage with the queen who was once her kingdom's greatest enemy. Though their union succeeds in ending the war, it marks the beginning of another.",
        editions: {
          standard: {
            price: "$23.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Ink Soaked Into Ashen Paper Cover.png"],
          },
          Special: {
            label: "Special",
            price: "$29.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/ink-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  devilinme: {
    name: "The Devil in Me",
    volumes: {
      1: {
        label: "Volume 1",
        release: "March 16, 2027",
        ////pages: "TBD",
        synopsis:
          "In a world where hope has all but vanished, two broken souls discover that even the darkest fate cannot keep them apart. Danielle Godin is a priestess devoted to God, or so it appears — behind her unwavering smile is a woman who has long since lost all hope. Then she meets a vampire with blood-red eyes, a woman just as broken as she is, surviving in the hell Earth has become. Drawn together by the quiet weight of their shared despair, the two find an unexpected refuge in one another.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Devil in me.png"],
          },
          limited: {
            price: "$15.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/devil-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  fairytrap: {
    name: "Fairy Trap",
    format: "A5 Paperback",
    volumes: {
      1: {
        label: "Volume 1",
        release: "March 16, 2027",
        ////pages: "TBD",
        synopsis:
          "He slept through most of his life. Until his dreams one day opened the door to another world. Joo Yigyeol spends twenty-two hours of every day asleep, imprisoned by the incurable Rostov Syndrome. But when he discovers that his consciousness can leave his sleeping body, the endless hours he once cursed become the key to a world beyond his own. Drawn onward by a golden butterfly, Yigyeol crosses into another dimension and encounters Seth, the enigmatic fourth prince of a kingdom on the brink of ruin.",
        editions: {
          standard: {
            price: "$23.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Fairy Trap Cover.png"],
          },
          Special: {
            label: "Special",
            price: "$29.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/FairyTrap-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  addictedtoyou: {
    name: "Addicted to You",
    volumes: {
      1: {
        label: "Volume 1",
        release: "November 16, 2027",
        ////pages: "TBD",
        synopsis:
          "At the boundary between angels and humans, 11 has one problem he cannot make sense of: his own heart. His complicated bond with 3 has already left him tangled in feelings he would rather not name. Then a chance encounter with a human girl introduces an entirely new complication. When 11 meets the girl again after her reincarnation, memories of her former life collide with the person she has become, rekindling a connection that should have ended with death.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Addicted-std.png"],
          },
          limited: {
            price: "$15.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Addicted-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  villainsdad: {
    name: "Flirting with the Villain's Dad",
    format: "A5 Paperback",
    volumes: {
      1: {
        label: "Volume 1",
        release: "February 16, 2027",
        //pages: "TBD",
        synopsis:
          "What happens when you wake up inside a novel you once read... twenty years before the story even begins? Princess Yerenica knows exactly how this tale ends. In blood. Determined to rewrite fate, Yerenica ends up captured by none other than King Euredian himself. There's just one tiny problem. He's nothing like the ruthless man the novel described. Armed with nothing but unwavering confidence, Yerenica embarks on the most ridiculous mission imaginable: seduce the villain's father before the original story can begin!",
        editions: {
          standard: {
            price: "$20.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Flirting with villains dad.png"],
          },
          limited: {
            price: "$22.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/flirting-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  rosemanor: {
    name: "Welcome to the Rose Manor",
    format: "A5 Paperback",
    volumes: {
      1: {
        label: "Volume 1",
        release: "March 16, 2027",
        ////pages: "TBD",
        synopsis:
          "Welcome to the Rose Manor. Please read the rules carefully. Your life may just depend on it. After her father's death, Richelle Howard's life crumbles overnight. An offer arrives from the kingdom's wealthiest family: live at the Manor of Roses for one year, teach the children, follow the rules. Never ignore the bells after midnight. Never enter certain rooms. Never question what you see. One year. One manor. One question: will Richelle survive?",
        editions: {
          standard: {
            price: "$20.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Welcome to the rose manor.jpeg"],
          },
          limited: {
            price: "$22.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/rosemanor-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  seameetsshore: {
    name: "Where the Sea Meets Shore",
    digitalOnly: true,
    volumes: {
      1: {
        label: "Digital Edition",
        release: "September 15, 2026",
        //pages: "TBD",
        synopsis:
          "A young photographer finds himself captivated by the mermaid displayed behind the glass of an aquarium, and longs to speak to her despite the barrier between them. Unable to do so, he returns day after day with his sketchbook, filling its pages with words that he shows her in the hope of reaching her. While he is free to come and go, she remains imprisoned behind the glass, forever separated from the sea she longs to return to.",
        editions: {
          standard: {
            price: "$6",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Where SEa Meets Shore Cover.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
    },
  },

  kissbeforegunshot: {
    name: "A Kiss Before the Gunshot",
    volumes: {
      1: {
        label: "Volume 1",
        release: "May 4, 2027",
        //pages: "TBD",
        synopsis:
          "An assassin dispatched for espionage. A princess divided between two selves. In ninety days, one of them will lose everything. Assassin Lyra Veyne has ninety days to infiltrate Elaria's royal palace and steal a classified document. Instead, she becomes personal bodyguard to Princess Seraphina Valmere, a sharp-tongued heir surrounded by assassination attempts, palace conspiracies, and an unwanted marriage.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/A kiss before gunshor cover .jpeg"],
          },
          limited: {
            price: "$15.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/kiss before-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  doomsdayrequiem: {
    name: "Doomsday Requiem With You",
    volumes: {
      1: {
        label: "Volume 1",
        release: "May 4, 2027",
        ////pages: "TBD",
        synopsis:
          "In a kingdom where a noble's worth is determined by the blessing they are born with, Lady Cellestia Varst has spent her entire life branded as the one thing no aristocrat should ever be: Blessingless. Cellestia forces her way into the Academy's prestigious Special Curriculum, where the strongest prepare for the return of the Enigma, an ancient calamity that awakens once every thousand years. Whispers speak of twelve forgotten curses. Break all twelve, and the Enigma may disappear forever.",
        editions: {
          standard: {
            price: "$23.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Doomsday cover.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  chiaroscuro: {
    name: "Chiaroscuro",
    volumes: {
      1: {
        label: "Volume 1",
        release: "April 13, 2027",
        //pages: "TBD",
        synopsis:
          "One blessed by the Sun. One cursed by the Night. Neither can save the world alone. For a thousand years, the kingdom of Esteria has lived beneath one impossible law: when the bells toll, every soul must sleep before night falls. Princess Lanasia has spent her life raised to become the next Sun of the Empire, the prophesied savior destined to prevent the Eclipse. Yet a haunting melody that only she can hear draws her into a hidden world that should never have existed.",
        editions: {
          standard: {
            price: "$12.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Chairoscuro Cover.png"],
          },
          limited: {
            price: "$15.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/chiaroscuro-ltd.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  soulguiders: {
    name: "Soul Guiders",
    volumes: {
      1: {
        label: "Volume 1",
        release: "April 13, 2027",
        //pages: "TBD",
        synopsis:
          "When Princess Yuzarinne awakens to a power she never asked for, she is thrust into an unlikely partnership with Zeo, a demon vice-commander as infamous for ignoring orders as he is for surviving them. Together, they must recover the scattered shards of the Orb of Salvation, an ancient relic said to hold the power to plunge the world into chaos, before they fall into the hands of the radical idealist Veydris, whose vision of peace demands the world's destruction.",
        editions: {
          standard: {
            price: "$23.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Soul guiders.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
      print: [
        {
          name: "Books-A-Million",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Indigo (Canada)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Waterstones (UK)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
        {
          name: "Buscalibre (Chile)",
          icon: "ti-building-store",
          url: null,
          available: false,
        },
      ],
    },
  },

  borrowing: {
    name: "Borrowing Your Textbook 175160",
    digitalOnly: true,
    volumes: {
      1: {
        label: "Digital Edition",
        release: "2026",
        pages: 73,
        synopsis:
          "Su Yao is 175cm tall and painfully aware of it. Liu Xi is 160cm — close enough that Su Yao never knows where to place her hands, her gaze, or her heart. It begins with an excuse to meet so small no one questions it: \"Can I borrow your textbook?\" One excuse turns into another. A shared desk. A sleeve tugged. A warm smile. Su Yao insists she's only being thoughtful, only being kind, but every time Liu Xi tilts her head and looks up, something inside Su Yao falters. Between after-school corridors and stolen glances, the distance between them tightens until breathing feels dangerous and standing still feels worse. What if she reaches out? What if she doesn't? A high-school yuri romance about first love, unspoken longing and the aching sweetness of wanting someone who is already within arm's reach — and wishing to be closer still.",
        editions: {
          standard: {
            price: "$6.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Borrowing-ch1.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
        {
          name: "Manga Plaza",
          icon: "ti-device-tablet",
          url: "https://mangaplaza.com/searchresult/?fre=Borrowing+Your+Textbook",
          available: true,
        },
      ],
    },
  },

  timeisa: {
    name: "Time Is a Closet",
    digitalOnly: true,
    volumes: {
      1: {
        label: "Digital Edition",
        release: "2026",
        pages: 110,
        synopsis:
          "This charming yuri manga follows two time travellers with an eye for fashion, journeying across eras in search of the most beautiful garments history has to offer. From forgotten wardrobes to dazzling period couture, their adventures weave together style, history and a budding romance. In the first instalment, two mysterious intruders appear in the treasured wardrobe room left behind by a girl's late grandmother - thus begins Time Is a Closet, with its enchanting prologue in which a young girl dons her ceremonial coming-of-age attire and blossoms like a flower. The story continues with the fateful meeting between Yaya and Haku, as the two begin a journey across time, travelling through different eras in pursuit of beautiful clothing and the stories woven into them. A yuri manga about time travel, fashion history and falling in love across eras.",
        editions: {
          standard: {
            price: "$6.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Time-ch1.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
        {
          name: "Manga Plaza",
          icon: "ti-device-tablet",
          url: "https://mangaplaza.com/title/0303012772/",
          available: true,
        },
        {
          name: "BookWalker",
          icon: "ti-book",
          url: "https://bookwalker.com/series/0YBA1BXHEZJG/time-is-a-closet",
          available: true,
        },
      ],
    },
  },

  octopiece: {
    name: "OctoPiece",
    digitalOnly: true,
    volumes: {
      1: {
        label: "Stand Alone",
        release: "June 2026",
        //pages: "TBD",
        synopsis:
          "On the remote island nation of Arakam, a soldier driven by justice and a mysterious wandering boy with no past are drawn into a story that blurs conviction and madness. Together, they walk a line that neither of them can fully see, where duty and delusion begin to look the same. A dark, standalone action fantasy that asks how far a person will go in the name of what they believe is right.",
        editions: {
          standard: {
            price: "$6",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Octopiece-vol1.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
      ],
    },
  },

  afternoontea: {
    name: "Afternoon Tea for Two",
    digitalOnly: true,
    volumes: {
      1: {
        label: "Digital Edition",
        release: "2026",
        pages: 90,
        synopsis:
          '"If I were to die, who would you drink tea with?" Mitsuruko, a refined yet endearingly absent-minded young lady, opens her home to Ritsu, a practical vocational student newly arrived in Tokyo. What begins as a matter of convenience soon grows into a quiet companionship, shaped by shared laughter, small mishaps and the comforting ritual of afternoon tea. Long ago, Mitsuruko was told by her grandmother to find someone to share tea with. But after leaving home, she comes to understand just how lonely a solitary cup can be. For Ritsu, life with Mitsuruko is anything but orderly — meals are burnt, bathwater is left running, and the rhythm of the household is delightfully unpredictable. Yet she gradually begins to see the quiet warmth beneath Mitsuruko\'s clumsy charm. A soft, heartwarming slice-of-life yuri about companionship, comfort and finding the one person who turns a house into a home.',
        editions: {
          standard: {
            price: "$6.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Afternoon-ch1.png"],
          },
        },
      },
    },
    retailers: {
      digital: [
        {
          name: "Crossed Hearts (Here)",
          icon: "ti-heart",
          url: null,
          available: true,
        },
        {
          name: "Manga Plaza",
          icon: "ti-device-tablet",
          url: "https://mangaplaza.com/title/0303012771/",
          available: true,
        },
        {
          name: "BookWalker",
          icon: "ti-book",
          url: "https://bookwalker.com/series/3YNKH12D9G10/aftertoon-tea-for-two",
          available: true,
        },
      ],
    },
  },

  reverse4you: {
    name: "Reverse 4 You",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 2026",
        //pages: "TBD",
        synopsis:
          "In a world where time bends to the will of an ordinary girl, Jattawa possesses the extraordinary ability to manipulate time itself. Her ambition is to become a lawyer and use her powers for money — but destiny takes a surprising turn when she meets Four, a mysterious senior foreseen by her sister's visions to be her soulmate. As their paths intertwine, Jattawa is haunted by a recurring sense of déjà vu, as though she and Four have found each other across countless lifetimes. Their connection defies the boundaries of time, raising questions about the nature of their bond. With the power to rewrite the past and save those she loves, Jattawa embarks on a race against time and destiny itself",
        editions: {
          standard: {
            price: "$25.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Reserve 4 you cover image.png"],
          },
        },
      },
    },
  },
  plslove: {
    name: "PLS Love",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 2026",
        //pages: "TBD",
        synopsis:
          "Panapsorn has spent years surviving the glittering, merciless world of nightlife entertainment, staying soft-spoken and selfless while hiding her wounds behind flawless smiles. Phakinee has never had to hide anything — beautiful, wealthy, and razor-sharp, she has always moved through life untouched, until she meets Panapsorn, whose quiet strength unsettles her in ways she can't explain away. An unexpected encounter becomes a pull neither woman can escape. But in a world ruled by power, secrets, and the ghosts of what came before, choosing each other is an act of courage. A fierce, aching, modern sapphic romance about two women — one learning she deserves love, and one discovering she can feel it — as they fight for a connection neither of them saw coming",
        editions: {
          standard: {
            price: "$25.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Pls Love.png"],
          },
        },
      },
    },
  },
  earthvows: {
    name: "Earth Vows of Land",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 2026",
        //pages: "TBD",
        synopsis:
          "Amid the rolling hills of northern Thailand, two women from rival farms are drawn together by fate, bound by love, and threatened by the weight of generations-old conflict. Din Kasama, the resilient and fiercely loyal owner of Saenrak Farm, has vowed to protect Rose, the radiant heir of Chomjan Flower Farm. But when long-buried secrets and family pressures turn deadly, Din stands her ground, ready to fight for Rose even if it means risking her own life. As shadows from the past close in and the truth unravels, Din and Rose must confront the depth of their feelings and the dangers that surround them. Their families are locked in an unspoken war, and their love is a rebellion against forces greater than themselves — a sweeping romance that asks whether love can truly conquer all, or whether it will be buried beneath the weight of the land that binds them",
        editions: {
          standard: {
            price: "$25.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/The Earth Vows of Land Cover image.png"],
          },
        },
      },
    },
  },
  cranium: {
    name: "Cranium",
    volumes: {
      1: {
        label: "Volume 1",
        release: "December 2026",
        //pages: "TBD",
        synopsis:
          "A violent plane crash throws Phinya and Busaya — former PhD classmates turned fierce rivals — into a tense reunion on a remote forensic field. Tasked with identifying the deceased, they find themselves tangled in the secrets of a mysterious skull, discovered far from where it belongs. Amid the perilous circumstances and the haunting duty they share, something shifts in their unyielding gazes. What was once resentment slowly stirs into a tender, unspoken connection, as if fate itself has set the stage for their reluctant bond to ignite against all odds",
        editions: {
          standard: {
            price: "$25.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Cranium cover image.png"],
          },
        },
      },
    },
  },
  enemieswithbenefits: {
    name: "Enemies With Benefits",
    volumes: {
      1: {
        label: "Volume 1",
        release: "August 2027",
        //pages: "TBD",
        synopsis:
          "We were two people who did not get along — but an unexpected turn of events changed everything. The next thing we knew, we had shared an unforgettable night together, and that was how our arrangement began. I was confident that I'd never fall in love with you, because a relationship born of desire could never become love. This Revised Edition features expanded content for longtime fans and newcomers alike",
        editions: {
          standard: {
            price: "$25.99",
            buyUrl: "https://thecrossedhearts.com/shop-all-1",
            images: ["Images/Enimes with Benefits cover image.png"],
          },
        },
      },
    },
  },
};

let CH_COVER_STATE = {};

function chResolveEditionKey(data, volume, edition) {
  const vol = data.volumes[volume];
  const keys = Object.keys(vol.editions);
  const lower = String(edition).toLowerCase();

  const exact = keys.find(function (k) {
    return k.toLowerCase() === lower;
  });
  if (exact) return exact;

  if (lower === "standard") {
    return (
      keys.find(function (k) {
        return k.toLowerCase() === "standard";
      }) || keys[0]
    );
  }

  return (
    keys.find(function (k) {
      return k.toLowerCase() !== "standard";
    }) || keys[0]
  );
}

function chInitCoverCarousel(titleKey, volume, edition) {
  volume = volume || 1;
  const data = CH_TITLE_MEDIA[titleKey];
  if (!data) return;
  const edKey = chResolveEditionKey(data, volume, edition || "standard");
  CH_COVER_STATE[titleKey] = { volume: volume, edition: edKey };
  chRenderCoverImage(titleKey);
}

function chRenderCoverImage(titleKey) {
  const state = CH_COVER_STATE[titleKey];
  const data = CH_TITLE_MEDIA[titleKey];
  if (!state || !data) return;

  const img = document.getElementById("coverMainImg");
  const badge = document.getElementById("coverEditionBadge");
  const priceEl = document.getElementById("coverEditionPrice");
  const buyBtn = document.getElementById("coverEditionBuyBtn");
  if (!img) return;

  // BUNDLE STATE
  if (state.edition === "bundle" && data.bundle) {
    const b = data.bundle;
    img.src = b.images[0];
    img.alt = data.name + " - " + b.label;
    img.onerror = function () {
      img.style.background = "var(--ink-card)";
    };
    if (badge) badge.textContent = "BUNDLE";
    if (priceEl) priceEl.textContent = b.price;
    if (buyBtn) buyBtn.textContent = "Add to Cart";
    return;
  }

  // BOX SET STATE
  if (state.edition === "boxset" && data.boxSet) {
    const bx = data.boxSet;
    img.src = bx.image;
    img.alt = data.name + " - " + bx.name;
    img.onerror = function () {
      img.style.background = "var(--ink-card)";
    };
    if (badge) badge.textContent = "BOX SET";
    if (priceEl) priceEl.textContent = bx.price;
    if (buyBtn) buyBtn.textContent = "Add to Cart";
    return;
  }

  // STANDARD / SPECIAL STATE
  const vol = data.volumes[state.volume];
  const ed = vol.editions[state.edition];
  if (!ed) return;

  img.src = ed.images[0];
  img.alt = data.name + " " + vol.label + " - " + (ed.label || state.edition);
  img.onerror = function () {
    img.style.background = "var(--ink-card)";
  };

  if (badge) {
    badge.textContent = (ed.label || state.edition).toUpperCase();
    const isStandard = String(state.edition).toLowerCase() === "standard";
    badge.classList.toggle("badge-standard", isStandard);
    badge.classList.toggle("badge-limited", !isStandard);
  }
  if (priceEl) priceEl.textContent = ed.price;
  if (buyBtn) buyBtn.textContent = "Add to Cart";

  const content = chGetEditionContent(titleKey, state.volume, state.edition);
  const noteEl = document.getElementById("coverEditionNote");
  if (noteEl) noteEl.textContent = content ? "Includes " + content : "";
}

/* Single source of truth for volume switching — handles bundle/boxset reset */
function chSwitchCoverVolume(titleKey, volume) {
  const state = CH_COVER_STATE[titleKey];
  if (!state) return;
  state.volume = volume;
  // If bundle or box set was selected, switching volume tabs drops back to standard
  if (state.edition === "bundle" || state.edition === "boxset") {
    const data = CH_TITLE_MEDIA[titleKey];
    state.edition = chResolveEditionKey(data, volume, "standard");
  }
  chRenderCoverImage(titleKey);
}

/* Single source of truth for edition switching — handles standard/Special/bundle/boxset */
function chSwitchEdition(titleKey, edition, btnEl) {
  const state = CH_COVER_STATE[titleKey];
  const data = CH_TITLE_MEDIA[titleKey];
  if (!state || !data) return;

  const lowerEdition = String(edition).toLowerCase();

  if (lowerEdition === "bundle") {
    state.edition = "bundle";
  } else if (lowerEdition === "boxset") {
    state.edition = "boxset";
  } else {
    state.edition = chResolveEditionKey(data, state.volume, edition);
  }

  document.querySelectorAll(".edition-toggle-btn").forEach(function (b) {
    b.classList.remove("active");
  });
  if (btnEl) btnEl.classList.add("active");
  chRenderCoverImage(titleKey);
}

function chAddCoverEditionToCart(titleKey) {
  const state = CH_COVER_STATE[titleKey];
  if (!state) return;
  if (state.edition === "boxset" && typeof chAddBoxSetToCart === "function") {
    chAddBoxSetToCart(titleKey);
    return;
  }
  if (
    state.edition === "bundle" &&
    typeof purchaseZombieSpecialBundle === "function"
  ) {
    purchaseZombieSpecialBundle(new Event("click"));
    return;
  }
  chAddPrintEditionToCart(titleKey, state.volume, state.edition);
}

let CH_VM_STATE = { images: [], slide: 0 };

function chOpenViewMore(titleKey, volume) {
  const data = CH_TITLE_MEDIA[titleKey];
  if (!data) return;
  const coverState = CH_COVER_STATE[titleKey] || { edition: "standard" };

  if (coverState.edition === "boxset" && data.boxSet) {
    chOpenBoxSetViewMore(titleKey);
    return;
  }

  if (coverState.edition === "bundle" && data.bundle) {
    chOpenBundleViewMore(titleKey);
    return;
  }

  let vol, ed, edKey;
  const isBundle = coverState.edition === "bundle" && !!data.bundle;

  if (isBundle) {
    ed = data.bundle;
    edKey = "bundle";
  } else {
    vol = data.volumes[volume];
    edKey = chResolveEditionKey(data, volume, coverState.edition);
    ed = vol.editions[edKey];
  }
  if (!ed) return;

  let overlay = document.getElementById("viewMoreOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "view-more-overlay";
    overlay.id = "viewMoreOverlay";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) chCloseViewMore();
    });
    document.body.appendChild(overlay);
  }

  const imagesHtml = ed.images
    .map(function (src) {
      return (
        '<img src="' +
        src +
        '" alt="' +
        data.name +
        '" onerror="this.style.display=\'none\'">'
      );
    })
    .join("");

  const titleLabel = isBundle
    ? ed.label
    : vol.label + " — " + (ed.label || edKey) + " Edition";

  const synopsisHtml = isBundle
    ? ed.synopsis
        .split("\n")
        .map(function (line) {
          return line ? '<p class="view-more-synopsis">' + line + "</p>" : "";
        })
        .join("")
    : '<p class="view-more-synopsis">' + vol.synopsis + "</p>";

  const formatRow =
    titleKey === "darling"
      ? ""
      : "<div><span>Format</span><span>" +
        (data.format || "B6 Paperback") +
        "</span></div>";

  const metaGrid = isBundle
    ? "<div><span>Release</span><span>" +
      ed.release +
      "</span></div>" +
      "<div><span>Pages</span><span>" +
      ed.pages +
      "</span></div>" +
      "<div><span>Price</span><span>" +
      ed.price +
      "</span></div>" +
      formatRow
    : "<div><span>Release</span><span>" +
      vol.release +
      "</span></div>" +
      "<div><span>Pages</span><span>" +
      vol.pages +
      "</span></div>" +
      "<div><span>Price</span><span>" +
      ed.price +
      "</span></div>" +
      formatRow;

  const buyOnClick = isBundle
    ? "purchaseZombieSpecialBundle(event)"
    : "chAddPrintEditionToCart('" +
      titleKey +
      "', " +
      volume +
      ", '" +
      edKey +
      "')";

  overlay.innerHTML =
    '<div class="view-more-modal">' +
    '<button class="view-more-close" onclick="chCloseViewMore()" aria-label="Close">✕</button>' +
    '<div class="ch-carousel" id="vmCarousel">' +
    '<div class="ch-carousel-track" id="vmCarouselTrack">' +
    imagesHtml +
    "</div>" +
    '<button class="ch-carousel-arrow ch-carousel-prev" onclick="chVMCarouselMove(-1)">‹</button>' +
    '<button class="ch-carousel-arrow ch-carousel-next" onclick="chVMCarouselMove(1)">›</button>' +
    '<div class="ch-carousel-dots" id="vmCarouselDots"></div>' +
    "</div>" +
    '<div class="viewmore-details">' +
    '<div class="view-more-title">' +
    data.name +
    "</div>" +
    '<div class="view-more-vol-label">' +
    titleLabel +
    "</div>" +
    synopsisHtml +
    '<div class="view-more-meta-grid">' +
    metaGrid +
    "</div>" +
    '<button type="button" class="btn-gold" style="margin-top:20px;" onclick="' +
    buyOnClick +
    '">Add to Cart — ' +
    ed.price +
    "</button>" +
    "</div>" +
    "</div>";

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  CH_VM_STATE = { images: ed.images, slide: 0 };
  chRenderVMDots();
}

const CH_EDITION_CONTENTS = {
  chigaya: { limited: "Shikishi" },
  zombie: { Special: "Dust Jacket & Sprayed Edges" },
  connie: { limited: "Shikishi" },
  archduke: { 1: { limited: "Bookmark" }, 2: { limited: "Photocard Set" } },
  baroness: {
    1: { limited: "Photocard + Pop-up Card" },
    2: { limited: "Photocard" },
    3: { limited: "Acrylic Standee" },
  },
  darling: { 1: { limited: "Pop-up Card" }, 2: { limited: "Bookmark" } },
  grenimal: { limited: "Shikishi" },
  fktl: {
    2: { limited: "Photocard Set" },
    3: { limited: "Postcard + Sticker Set" },
  },
  matchmaker: { limited: "Shikishi" },
  raeliana: { Special: "Dust Jacket & Sprayed Edges" },
  gaze: { limited: "Photocard" },
  thebird: { limited: "Photocard" },
  theking: { limited: "Photocard" },
  until: { limited: "Bookmark" },
};

function chGetEditionContent(titleKey, volume, editionKey) {
  const entry = CH_EDITION_CONTENTS[titleKey];
  if (!entry) return null;

  if (entry[volume] && typeof entry[volume] === "object") {
    return entry[volume][editionKey] || null;
  }

  return entry[editionKey] || null;
}

/* ================================================
   DIGITAL PAGE — View More + Volume Switching
   Generic for every title. Uses CH_TITLE_MEDIA.
   ================================================ */

let CH_DIGITAL_STATE = {};

function chInitDigitalVolume(titleKey, volume) {
  CH_DIGITAL_STATE[titleKey] = { volume: volume || 1 };
}

function chGetDigitalVolumePrice(volume) {
  const tab = document.getElementById("tab-v" + volume);
  const priceEl = tab ? tab.querySelector(".vol-tab-price") : null;
  return priceEl ? priceEl.textContent.trim() : "";
}

function chSwitchDigitalVolume(titleKey, volume) {
  const data = CH_TITLE_MEDIA[titleKey];
  if (!data) return;
  const vol = data.volumes[volume];
  if (!vol) return;

  // Toggle tabs/panels for however many volumes this title has
  Object.keys(data.volumes).forEach(function (v) {
    const tab = document.getElementById("tab-v" + v);
    const panel = document.getElementById("panel-v" + v);
    const isActive = Number(v) === Number(volume);
    if (tab) tab.classList.toggle("active", isActive);
    if (panel) panel.classList.toggle("active", isActive);
  });

  // Update the main cover image (Standard edition, first image)
  const img = document.getElementById("mainCoverImg");
  if (img) {
    const ed = vol.editions.standard || Object.values(vol.editions)[0];
    if (ed && ed.images && ed.images[0]) {
      img.src = ed.images[0];
      img.alt = data.name + " " + vol.label;
    }
  }

  // Update synopsis
  const syn = document.getElementById("mainSynopsis");
  if (syn) syn.innerHTML = vol.synopsis;

  // --- Update left-side meta box: Status / Volumes / Pages ---
  const now = new Date();
  const totalVolumes = Object.keys(data.volumes).length;

  const releasedCount = Object.keys(data.volumes).filter(function (v) {
    const d = new Date(data.volumes[v].release);
    return !isNaN(d) && d <= now;
  }).length;

  const thisVolDate = new Date(vol.release);
  const thisVolReleased = !isNaN(thisVolDate) && thisVolDate <= now;

  const statusEl = document.getElementById("metaStatus");
  if (statusEl) {
    statusEl.textContent =
      "Vol " + volume + " - " + (thisVolReleased ? "Ongoing" : "Upcoming");
    statusEl.style.color = thisVolReleased ? "#7ec97e" : "#d4af37";
  }

  const volumesEl = document.getElementById("metaVolumes");
  if (volumesEl) {
    volumesEl.textContent = releasedCount + " of " + totalVolumes + " Released";
  }

  const pagesEl = document.getElementById("metaPages");
  if (pagesEl) {
    if (vol.pages) {
      pagesEl.textContent = "~" + vol.pages + " pages";
      pagesEl.parentElement.style.display = "";
    } else {
      // hide the row gracefully if a title has no page count yet
      pagesEl.parentElement.style.display = "none";
    }
  }

  CH_DIGITAL_STATE[titleKey] = { volume: Number(volume) };
}

function chOpenDigitalViewMore(titleKey) {
  const data = CH_TITLE_MEDIA[titleKey];
  if (!data) return;

  const state = CH_DIGITAL_STATE[titleKey] || { volume: 1 };
  const vol = data.volumes[state.volume];
  if (!vol) return;

  const ed = vol.editions.standard || Object.values(vol.editions)[0];
  const image = ed && ed.images && ed.images[0] ? ed.images[0] : "";
  const price = chGetDigitalVolumePrice(state.volume);

  let overlay = document.getElementById("viewMoreOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "view-more-overlay";
    overlay.id = "viewMoreOverlay";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) chCloseViewMore();
    });
    document.body.appendChild(overlay);
  }

  overlay.innerHTML =
    '<div class="view-more-modal">' +
    '<button class="view-more-close" onclick="chCloseViewMore()" aria-label="Close">✕</button>' +
    '<div class="view-more-cover-static">' +
    '<img src="' +
    image +
    '" alt="' +
    data.name +
    '" onerror="this.style.display=\'none\'" style="width:100%;height:100%;object-fit:cover;display:block;">' +
    "</div>" +
    '<div class="viewmore-details">' +
    '<div class="view-more-title">' +
    data.name +
    "</div>" +
    '<div class="view-more-vol-label">' +
    vol.label +
    " — Digital Edition</div>" +
    '<p class="view-more-synopsis">' +
    vol.synopsis +
    "</p>" +
    '<div class="view-more-meta-grid">' +
    "<div><span>Release</span><span>" +
    vol.release +
    "</span></div>" +
    "<div><span>Price</span><span>" +
    price +
    "</span></div>" +
    "</div>" +
    "</div>" +
    "</div>";

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function chApplyPrintDeepLink(titleKey) {
  const params = new URLSearchParams(window.location.search);
  const volParam = parseInt(params.get("vol"), 10);
  const edition = params.get("edition");

  if (!isNaN(volParam) && typeof switchVol === "function") {
    switchVol(volParam);
  }

  if (edition) {
    const idMap = {
      standard: "editionTabStandard",
      limited: "editionTabLimited",
      special: "editionTabSpecial",
      bundle: "editionTabBundle",
      boxset: "editionTabBoxSet",
    };
    const btnId = idMap[edition.toLowerCase()] || "editionTabStandard";
    const btn =
      document.getElementById(btnId) ||
      document.getElementById("editionTabStandard");
    chSwitchEdition(titleKey, edition, btn);
  }
}

function chOpenBundleViewMore(titleKey) {
  const data = CH_TITLE_MEDIA[titleKey];
  const bundle = data && data.bundle;
  if (!bundle) return;

  let overlay = document.getElementById("viewMoreOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "view-more-overlay";
    overlay.id = "viewMoreOverlay";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) chCloseViewMore();
    });
    document.body.appendChild(overlay);
  }

  const synopsisHtml = bundle.synopsis
    .split("\n")
    .map(function (line) {
      return line ? '<p class="view-more-synopsis">' + line + "</p>" : "";
    })
    .join("");

  overlay.innerHTML =
    '<div class="view-more-modal">' +
    '<button class="view-more-close" onclick="chCloseViewMore()" aria-label="Close">✕</button>' +
    '<div class="view-more-cover-static">' +
    '<img src="' +
    bundle.images[0] +
    '" alt="' +
    bundle.label +
    '" onerror="this.style.display=\'none\'" style="width:100%; height:100%; object-fit:cover; display:block;">' +
    "</div>" +
    '<div class="viewmore-details">' +
    '<div class="view-more-title">' +
    data.name +
    "</div>" +
    '<div class="view-more-vol-label">' +
    bundle.label +
    "</div>" +
    synopsisHtml +
    '<div class="view-more-meta-grid">' +
    "<div><span>Release</span><span>" +
    bundle.release +
    "</span></div>" +
    "<div><span>Pages</span><span>" +
    bundle.pages +
    "</span></div>" +
    "<div><span>Price</span><span>" +
    bundle.price +
    "</span></div>" +
    "<div><span>Format</span><span>" +
    (data.format || "B6 Paperback") +
    "</span></div>" +
    "</div>" +
    '<button type="button" class="btn-gold" style="margin-top:20px;" ' +
    'onclick="purchaseZombieSpecialBundle(event)">' +
    "Add to Cart — " +
    bundle.price +
    "</button>" +
    "</div>" +
    "</div>";

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function chOpenBoxSetViewMore(titleKey) {
  const data = CH_TITLE_MEDIA[titleKey];
  const box = data && data.boxSet;
  if (!box) return;

  let overlay = document.getElementById("viewMoreOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "view-more-overlay";
    overlay.id = "viewMoreOverlay";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) chCloseViewMore();
    });
    document.body.appendChild(overlay);
  }

  const includesHtml = (box.includes || [])
    .map(function (item) {
      return "<li>" + item + "</li>";
    })
    .join("");

  overlay.innerHTML =
    '<div class="view-more-modal">' +
    '<button class="view-more-close" onclick="chCloseViewMore()" aria-label="Close">✕</button>' +
    '<div class="view-more-cover-static">' +
    '<img src="' +
    box.image +
    '" alt="' +
    box.name +
    '" onerror="this.style.display=\'none\'" style="width:100%; height:100%; object-fit:cover; display:block;">' +
    "</div>" +
    '<div class="viewmore-details">' +
    '<div class="view-more-title">' +
    box.name +
    "</div>" +
    '<ul class="view-more-includes" style="padding-left:18px; line-height:1.8;">' +
    includesHtml +
    "</ul>" +
    '<div class="view-more-meta-grid">' +
    "<div><span>Price</span><span>" +
    box.price +
    "</span></div>" +
    "<div><span>Format</span><span>" +
    (data.format || "B6 Paperback") +
    "</span></div>" +
    "</div>" +
    '<button type="button" class="btn-gold" style="margin-top:20px;" ' +
    "onclick=\"chAddBoxSetToCart('" +
    titleKey +
    "')\">" +
    "Add to Cart — " +
    box.price +
    "</button>" +
    "</div>" +
    "</div>";

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function chVMCarouselMove(dir) {
  CH_VM_STATE.slide =
    (CH_VM_STATE.slide + dir + CH_VM_STATE.images.length) %
    CH_VM_STATE.images.length;
  const track = document.getElementById("vmCarouselTrack");
  if (track)
    track.style.transform = "translateX(-" + CH_VM_STATE.slide * 100 + "%)";
  chRenderVMDots();
}

function chVMGoTo(i) {
  CH_VM_STATE.slide = i;
  const track = document.getElementById("vmCarouselTrack");
  if (track) track.style.transform = "translateX(-" + i * 100 + "%)";
  chRenderVMDots();
}

function chRenderVMDots() {
  const dots = document.getElementById("vmCarouselDots");
  if (!dots) return;
  dots.innerHTML = CH_VM_STATE.images
    .map(function (_, i) {
      return (
        '<span class="ch-carousel-dot' +
        (i === CH_VM_STATE.slide ? " active" : "") +
        '" onclick="chVMGoTo(' +
        i +
        ')"></span>'
      );
    })
    .join("");
}

function chCloseViewMore() {
  const overlay = document.getElementById("viewMoreOverlay");
  if (overlay) overlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") chCloseViewMore();
});

function chRenderRetailers(titleKey, containerId, type) {
  const data = CH_TITLE_MEDIA[titleKey];
  const container = document.getElementById(containerId);
  const list = data && data.retailers ? data.retailers[type] : null;
  if (!list || !container) return;

  container.innerHTML = list
    .map(function (r) {
      if (!r.available) {
        return (
          '<div class="retailer-badge coming-soon">' +
          '<i class="ti ' +
          r.icon +
          '" aria-hidden="true"></i>' +
          "<span>" +
          r.name +
          "</span>" +
          '<span class="status">Coming Soon</span>' +
          "</div>"
        );
      }
      if (!r.url) {
        return (
          '<div class="retailer-badge">' +
          '<i class="ti ' +
          r.icon +
          '" aria-hidden="true"></i>' +
          "<span>" +
          r.name +
          "</span>" +
          "</div>"
        );
      }
      return (
        '<a href="' +
        r.url +
        '" target="_blank" class="retailer-badge">' +
        '<i class="ti ' +
        r.icon +
        '" aria-hidden="true"></i>' +
        "<span>" +
        r.name +
        "</span>" +
        "</a>"
      );
    })
    .join("");
}

function chAddPrintEditionToCart(titleKey, volume, edition) {
  const data = CH_TITLE_MEDIA[titleKey];
  if (!data) return;
  const vol = data.volumes[volume];
  const edKey = chResolveEditionKey(data, volume, edition);
  const ed = vol.editions[edKey];
  if (!ed) return;

  const priceNum = parseFloat(String(ed.price).replace(/[^0-9.]/g, "")) || 0;
  const edName = ed.label || edKey.charAt(0).toUpperCase() + edKey.slice(1);
  const content = chGetEditionContent(titleKey, Number(volume), edKey);

  // Full, non-truncated label e.g. "Volume 2: Limited Edition with Photocard Set"
  const editionLabel =
    vol.label +
    ": " +
    edName +
    " Edition" +
    (content ? " with " + content : "");

  if (typeof chAddPrintToCart === "function") {
    chAddPrintToCart({
      sku:
        "PRINT-" +
        titleKey.toUpperCase() +
        "-V" +
        volume +
        "-" +
        edKey.toUpperCase(),
      title: data.name,
      edition: editionLabel,
      unitPrice: priceNum,
      coverImageUrl: ed.images[0],
      isPreorder: false,
    });
  }
  if (typeof showToast === "function") {
    showToast(vol.label + " (" + edName + ") added to cart!", "success");
  }
}

function chAddBoxSetToCart(titleKey) {
  const data = CH_TITLE_MEDIA[titleKey];
  const box = data && data.boxSet;
  if (!box) return;
  const priceNum = parseFloat(String(box.price).replace(/[^0-9.]/g, "")) || 0;

  if (typeof chAddPrintToCart === "function") {
    chAddPrintToCart({
      sku: "PRINT-" + titleKey.toUpperCase() + "-BOXSET",
      title: box.name,
      edition: "Collector's Box Set",
      unitPrice: priceNum,
      coverImageUrl: box.image,
      isPreorder: true,
    });
  }
  if (typeof showToast === "function") {
    showToast(box.name + " added to cart!", "success");
  }
}

(function () {
  const ACTIVE_TIMERS = new WeakMap();

  function parseReleaseDate(raw) {
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function updateLinkedButton(groupId, isPreorder) {
    if (!groupId) return;
    document
      .querySelectorAll(`[data-preorder-label="${groupId}"]`)
      .forEach((btn) => {
        const firstLine = btn.querySelector("div") || btn.firstElementChild;
        if (!firstLine) return;

        if (isPreorder) {
          if (!btn.dataset.originalLabel) {
            btn.dataset.originalLabel = firstLine.textContent;
          }
          firstLine.textContent = "Pre-Order Now";
          btn.classList.add("is-preorder");
        } else if (btn.dataset.originalLabel) {
          firstLine.textContent = btn.dataset.originalLabel;
          btn.classList.remove("is-preorder");
        }
      });
  }

  function render(el, releaseDate) {
    const now = new Date();
    const diff = releaseDate - now;

    if (diff <= 0) {
      el.innerHTML = "";
      el.classList.remove("ch-preorder-active");
      updateLinkedButton(el.dataset.preorderGroup, false);
      const timer = ACTIVE_TIMERS.get(el);
      if (timer) clearInterval(timer);
      el.dispatchEvent(
        new CustomEvent("ch-countdown-complete", { bubbles: true }),
      );
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    el.classList.add("ch-preorder-active");
    updateLinkedButton(el.dataset.preorderGroup, true);

    el.innerHTML = `
      <span class="ch-preorder-label">
        <i class="ti ti-clock-hour-4" aria-hidden="true"></i>
        Pre-Order &middot; Releases In
      </span>
      <div class="ch-preorder-timer" role="timer" aria-live="off">
        <div class="ch-cd-unit"><span class="ch-cd-num">${days}</span><span class="ch-cd-unit-label">Days</span></div>
        <span class="ch-cd-sep">:</span>
        <div class="ch-cd-unit"><span class="ch-cd-num">${pad(hours)}</span><span class="ch-cd-unit-label">Hrs</span></div>
        <span class="ch-cd-sep">:</span>
        <div class="ch-cd-unit"><span class="ch-cd-num">${pad(mins)}</span><span class="ch-cd-unit-label">Min</span></div>
        <span class="ch-cd-sep">:</span>
        <div class="ch-cd-unit"><span class="ch-cd-num">${pad(secs)}</span><span class="ch-cd-unit-label">Sec</span></div>
      </div>
    `;
  }

  /**
   * Initialize (or re-initialize) all countdown elements within `root`.
   * Safe to call repeatedly — clears any prior interval on each element
   * before starting a new one.
   */
  function chInitCountdowns(root) {
    root = root || document;
    const els = root.querySelectorAll("[data-release-date]");

    els.forEach((el) => {
      const prevTimer = ACTIVE_TIMERS.get(el);
      if (prevTimer) clearInterval(prevTimer);

      const releaseDate = parseReleaseDate(el.dataset.releaseDate);
      if (!releaseDate) {
        el.innerHTML = "";
        return;
      }

      render(el, releaseDate);

      if (releaseDate - new Date() > 0) {
        const timer = setInterval(() => render(el, releaseDate), 1000);
        ACTIVE_TIMERS.set(el, timer);
      }
    });
  }

  // Expose globally so it can be called after dynamic content changes
  // (e.g. inside your existing switchVol() / chSwitchEdition() functions).
  window.chInitCountdowns = chInitCountdowns;

  document.addEventListener("DOMContentLoaded", () => chInitCountdowns());

  // ---- Injected styles (kept in JS so this is a single drop-in file) ----
  const style = document.createElement("style");
  style.textContent = `
    .ch-preorder-countdown {
      display: none;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid rgba(212, 175, 55, 0.35);
      background: linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.04));
      font-family: var(--font-b, "DM Sans", sans-serif);
    }
    .ch-preorder-countdown.ch-preorder-active {
      display: flex;
    }
    .ch-preorder-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--gold, #d4af37);
    }
    .ch-preorder-timer {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ch-cd-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 40px;
      padding: 6px 4px;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.18);
    }
    .ch-cd-num {
      font-family: var(--font-a, "Playfair Display", serif);
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      line-height: 1;
    }
    .ch-cd-unit-label {
      margin-top: 2px;
      font-size: 9px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--muted, #9a9a9a);
    }
    .ch-cd-sep {
      color: rgba(212, 175, 55, 0.5);
      font-weight: 700;
      transform: translateY(-6px);
    }
    button.is-preorder {
      background: linear-gradient(135deg, #d4af37, #b8941f) !important;
      color: #1a0f08 !important;
    }
  `;
  document.head.appendChild(style);
})();
