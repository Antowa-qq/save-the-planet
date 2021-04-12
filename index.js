// delay
Promise.delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const headerTitileText = "The top 10 most endangered species in the world";
const headerTitile = document.querySelector(".header__title-text");

//typing effect
(async () => {
  for (let char of headerTitileText) {
    headerTitile.textContent += char;
    await Promise.delay(100);
  }
  // remove typed line
  document.querySelector(".typed-line").remove();
})();

const navigation = document.querySelector(".navigation");

const CANVAS_WIDTH = 580;
const CANVAS_HEIGHT = 350;
const PADDING_BETWEEN_COLUMNS = 55; //55
const COLUMN_WIDTH = 50;
const PADDING_CANVAS_LEFT = 20;
const PADDING_TOP_BOTTOM = 200;

navigation.addEventListener("click", async (e) => {
  const element = e.target.closest(".navigation__item");
  if (element && !element.className.includes("active")) {
    // set \ remove active card and link
    if (document.querySelector(".navigation__item.active")) {
      document.querySelector(".navigation__item.active").classList.remove("active");
    }
    element.classList.add("active");

    if (document.querySelector(".card_active")) {
      document.querySelector(".card_active").classList.remove("card_active");
    }

    const idElement = element.getAttribute("item-id");
    document.querySelector(`.card[item-id$="${idElement}"`).classList.add("card_active");

    // if you need to build a graph
    if (data[idElement]) {
      const canvas = document.querySelector(`.card[item-id$="${idElement}"] canvas`);
      const ctx = canvas.getContext("2d");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      await Promise.delay(4000);
      chart(ctx, data[idElement]);
    }
  }
});

// plotting on canvas

const chart = async (ctx, data) => {
  console.log(ctx);
  let maxValue = data.column[0].value;

  for (let i = 1; i < data.column.length; i++) {
    maxValue = Math.max(maxValue, data.column[i].value);
  }

  let k = -((CANVAS_HEIGHT - PADDING_TOP_BOTTOM) / maxValue);
  let index = 1;
  let iteration_count = maxValue / 100;
  fillText(
    ctx,
    data.caption,
    PADDING_BETWEEN_COLUMNS + COLUMN_WIDTH,
    CANVAS_HEIGHT - 20,
    "black",
    "bold 18px Roboto , sans-serif",
    "left"
  );

  if (data.captionNext) {
    fillText(
      ctx,
      data.captionNext,
      PADDING_BETWEEN_COLUMNS + COLUMN_WIDTH,
      CANVAS_HEIGHT,
      "black",
      "bold 18px Roboto , sans-serif",
      "left"
    );
  }

  for (const item of data.column) {
    fillText(
      ctx,
      item.footer_title,
      (PADDING_BETWEEN_COLUMNS + COLUMN_WIDTH) * index + COLUMN_WIDTH / 2,
      CANVAS_HEIGHT - PADDING_TOP_BOTTOM / 2 + 30,
      "#4F97EC",
      "500 24px Rubik , sans-serif"
    );

    await new Promise((resolve) => {
      fillColumn(ctx, index, k, iteration_count, iteration_count, item.value, item.color, () => {
        resolve();
      });
    });

    fillText(
      ctx,
      item.header_title,
      (PADDING_BETWEEN_COLUMNS + COLUMN_WIDTH) * index + COLUMN_WIDTH / 2,
      CANVAS_HEIGHT - item.value * -k - PADDING_TOP_BOTTOM / 2 - 10,
      "black",
      "bold 30px Rubik , sans-serif"
    );
    index++;
  }

  index = 1;
  for (const item of data.arrow) {
    
    const kRation = data.arrow.length > 1 ? 40 : 0;
    const x1 = (PADDING_BETWEEN_COLUMNS + COLUMN_WIDTH) * item.fromColumn + kRation;
    const x2 = (PADDING_BETWEEN_COLUMNS + COLUMN_WIDTH) * item.toColumn + PADDING_BETWEEN_COLUMNS - 10 - kRation;
    const y1 = CANVAS_HEIGHT - data.column[item.fromColumn - 1].value * -k - PADDING_TOP_BOTTOM / 2 - 80;
    const y2 = CANVAS_HEIGHT - data.column[item.toColumn - 1].value * -k - PADDING_TOP_BOTTOM / 2 - 80;

    const vector = {
      x: (x2 - x1) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
      y: (y2 - y1) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    };
    console.log(vector);

    await new Promise((resolve) => {
      fillArrow(ctx, x1, y1, x2, y2, vector.x, vector.y, x1, y1, item.color, () => {
        resolve();
      });
    });
  }
};

const fillText = (ctx, text, x, y, color = "#4F97EC", font, textAlign = "center") => {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.fillText(text, x, y);
};

const fillColumn = async (ctx, index, k, iteration_count, count, value, color, callback) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(
    (PADDING_BETWEEN_COLUMNS + COLUMN_WIDTH) * index,
    CANVAS_HEIGHT - PADDING_TOP_BOTTOM / 2,
    COLUMN_WIDTH,
    count * k
  );

  ctx.stroke();
  ctx.closePath();
  count += iteration_count;
  if (value >= count) {
    await Promise.delay(10);
    fillColumn(ctx, index, k, iteration_count, count, value, color, callback);
  } else {
    callback();
  }
};

const fillArrow = async (ctx, x1, y1, x2, y2, ix, iy, newx, newy, color, callback) => {
  let angle;
  let x;
  let y;
  let radius = 6;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.moveTo(x1, y1);
  ctx.lineTo(newx, newy);

  if (x2 >= newx && y2 >= iy) {
    newx += ix * 2;
    newy += iy * 2;
    await Promise.delay(10);
    fillArrow(ctx, x1, y1, x2, y2, ix, iy, newx, newy, color, callback);
  } else {
    angle = Math.atan2(y2 - y1, x2 - x1);
    x = radius * Math.cos(angle) + x2;
    y = radius * Math.sin(angle) + y2;

    ctx.moveTo(x, y);

    angle += (1.0 / 3.0) * (2 * Math.PI);
    x = radius * Math.cos(angle) + x2;
    y = radius * Math.sin(angle) + y2;

    ctx.lineTo(x, y);

    angle += (1.0 / 3.0) * (2 * Math.PI);
    x = radius * Math.cos(angle) + x2;
    y = radius * Math.sin(angle) + y2;
    ctx.lineTo(x, y);

    callback();
  }
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
};

// data for the graph on the canvas
const data = {
  1: {
    caption: "Рopulation of Amur lepards in the Russia in wild nature",
    column: [
      {
        value: 28,
        color: "#4F97EC",
        header_title: "22-28",
        footer_title: "2000",
      },
      {
        value: 30,
        color: "#4F97EC",
        header_title: "28-30",
        footer_title: "2003",
      },
      {
        value: 50,
        color: "#4F97EC",
        header_title: "48-50",
        footer_title: "2013",
      },
      {
        value: 80,
        color: "#4F97EC",
        header_title: "~80",
        footer_title: "2019",
      },
    ],
    arrow: [
      {
        fromColumn: 1,
        toColumn: 4,
        color: "#B2D95E",
      },
    ],
  },
  2: {
    caption: "Рopulation of Javan rhinoceros in the Indonesia",
    column: [
      {
        value: 60,
        color: "#4F97EC",
        header_title: "60",
        footer_title: "2010",
      },
      {
        value: 60,
        color: "#4F97EC",
        header_title: "60",
        footer_title: "2015",
      },
      {
        value: 74,
        color: "#4F97EC",
        header_title: "74",
        footer_title: "2020",
      },
    ],
    arrow: [
      {
        fromColumn: 1,
        toColumn: 3,
        color: "#B2D95E",
      },
    ],
  },
  3: {
    caption: "Рopulation of Mountian gorillas",
    column: [
      {
        value: 254,
        color: "#4F97EC",
        header_title: "254",
        footer_title: "1981",
      },
      {
        value: 380,
        color: "#4F97EC",
        header_title: "380",
        footer_title: "2003",
      },
      {
        value: 480,
        color: "#4F97EC",
        header_title: "480",
        footer_title: "2010",
      },
      {
        value: 1063,
        color: "#4F97EC",
        header_title: "1063",
        footer_title: "2010-2020",
      },
    ],
    arrow: [
      {
        fromColumn: 1,
        toColumn: 4,
        color: "#B2D95E",
      },
    ],
  },
  4: {
    caption: "Рopulation of Vaguita",
    column: [
      {
        value: 567,
        color: "#4F97EC",
        header_title: "567",
        footer_title: "1997",
      },
      {
        value: 150,
        color: "#4F97EC",
        header_title: "150",
        footer_title: "2007",
      },
      {
        value: 19,
        color: "#EC4F4F",
        header_title: "19",
        footer_title: "2018",
      },
      {
        value: 10,
        color: "#EC4F4F",
        header_title: "~10",
        footer_title: "2020",
      },
    ],
    arrow: [
      {
        fromColumn: 1,
        toColumn: 4,
        color: "#EC4F4F",
      },
    ],
  },
  6: {
    caption: "Рopulation of Gharial ",
    column: [
      {
        value: 200,
        color: "#4F97EC",
        header_title: ">200",
        footer_title: "1976",
      },
      {
        value: 436,
        color: "#4F97EC",
        header_title: "436",
        footer_title: "2000",
      },
      {
        value: 182,
        color: "#4F97EC",
        header_title: "182",
        footer_title: "2006",
      },
      {
        value: 250,
        color: "#4F97EC",
        header_title: "~250",
        footer_title: "2020",
      },
    ],
    arrow: [
      {
        fromColumn: 1,
        toColumn: 2,
        color: "#B2D95E",
      },
      {
        fromColumn: 2,
        toColumn: 3,
        color: "#B2D95E",
      },
      {
        fromColumn: 3,
        toColumn: 4,
        color: "#B2D95E",
      },
    ],
  },
  7: {
    caption: "Рopulation of Amur tigers in eastern Russia",
    column: [
      {
        value: 100,
        color: "#4F97EC",
        header_title: "~100",
        footer_title: "1958",
      },
      {
        value: 140,
        color: "#4F97EC",
        header_title: "140",
        footer_title: "1968",
      },
      {
        value: 393,
        color: "#4F97EC",
        header_title: "331-393",
        footer_title: "2005",
      },
      {
        value: 540,
        color: "#4F97EC",
        header_title: "480-540",
        footer_title: "2015-2020",
      },
    ],
    arrow: [
      {
        fromColumn: 1,
        toColumn: 4,
        color: "#B2D95E",
      },
    ],
  },
  8: {
    caption: `Рopulation of North Atlantic right whales`,
    captionNext: "in the western North Atlantic",
    column: [
      {
        value: 361,
        color: "#4F97EC",
        header_title: "361",
        footer_title: "2005",
      },
      {
        value: 396,
        color: "#4F97EC",
        header_title: "396",
        footer_title: "2012",
      },
      {
        value: 500,
        color: "#4F97EC",
        header_title: "~500",
        footer_title: "2020",
      },
    ],
    arrow: [
      {
        fromColumn: 1,
        toColumn: 3,
        color: "#B2D95E",
      },
    ],
  },
};
