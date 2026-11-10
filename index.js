
const BASE_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const FALLBACK_URL =
  "https://latest.currency-api.pages.dev/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const form = document.querySelector("form");

const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");

const msg1 = document.querySelector(".msg1");
const amount = document.querySelector(".amount input");

// Populate currency dropdowns
for (let select of dropdowns) {
  for (let currCode of Object.keys(countryList)) {
    let newOption = document.createElement("option");

    newOption.innerText = currCode;
    newOption.value = currCode;

    if (select.name === "from" && currCode === "USD") {
      newOption.selected = true;
    } else if (select.name === "to" && currCode === "INR") {
      newOption.selected = true;
    }

    select.append(newOption);
  }

  // Update flag when currency changes
  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
    updateExchangeRate();
  });
}

// Update country flags
const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];

  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;

  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

// Fetch exchange rates with fallback
const fetchExchangeRate = async (from, to) => {
  const urls = [
    `${BASE_URL}/${from.toLowerCase()}.json`,
    `${FALLBACK_URL}/${from.toLowerCase()}.json`
  ];

  for (let url of urls) {
    try {
      let response = await fetch(url);

      if (!response.ok) {
        continue;
      }

      let data = await response.json();

      let rate = data[from.toLowerCase()]?.[to.toLowerCase()];

      if (typeof rate === "number") {
        return rate;
      }
    } catch (error) {
      console.log("API error:", error);
    }
  }

  throw new Error("Unable to fetch exchange rate.");
};

// Update exchange rate
const updateExchangeRate = async () => {
  let amtVal = Number(amount.value);

  if (!Number.isFinite(amtVal) || amtVal <= 0) {
    amtVal = 1;
    amount.value = "";
  }

  let from = fromCurr.value;
  let to = toCurr.value;

  msg1.innerText = "Getting exchange rate...";

  try {
    let rate = await fetchExchangeRate(from, to);

    let finalAmount = amtVal * rate;

    msg1.innerText =
      `${amtVal} ${from} = ${finalAmount.toFixed(2)} ${to}`;

  } catch (error) {
    msg1.innerText = "Unable to get exchange rate. Please try again.";

    console.error(error);
  }
};

// Submit button
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

// Update when amount changes
amount.addEventListener("input", () => {
  updateExchangeRate();
});

// Initial flags and exchange rate
window.addEventListener("load", () => {
  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
});
