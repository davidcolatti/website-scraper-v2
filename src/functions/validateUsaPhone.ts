import phone from "phone";

const USA_COUNTRY = "USA";

export default (number: string) => {
  const initalFilter = phone(number);
  const { isValid, countryIso3, phoneNumber } = initalFilter;

  if (!isValid) return null;
  const cleanedNum = phoneNumber.replace(/\+1/, "");
  return countryIso3 === USA_COUNTRY ? cleanedNum : null;
};
