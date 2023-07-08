const getQuote = async () => {
  const response = await fetch("https://api.quotable.io/random");
  const data = await response.json();
  return data;
};

const getQuoteThen = () => {
  fetch("https://api.quotable.io/random")
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
    });
};
