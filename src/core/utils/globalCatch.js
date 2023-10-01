
export const globalCatch = (request, error) => {
  console.log(
    `Error in catch with route ${request.path} with method ${request.method} and with message ${error}`
  );
};
