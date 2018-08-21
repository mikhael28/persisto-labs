export const hello = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: `${process.env.POSTMARK_KEY}`,
    }),
  };

  callback(null, response);
};
