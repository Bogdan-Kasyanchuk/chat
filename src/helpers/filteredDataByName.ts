const filteredDataByName = (data: { name: string; [x: string]: any }[], value: string) => {
  return data.filter((el) => el.name?.toLowerCase().includes(value.toLowerCase().trim()));
};

export default filteredDataByName;
