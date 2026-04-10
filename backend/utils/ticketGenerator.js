const generateTicketNumber = (index) => {
  const padded = String(index).padStart(6, '0');
  return `LT-${padded}`;
};

const generateBulkTicketNumbers = (startIndex, quantity) => {
  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    tickets.push(generateTicketNumber(startIndex + i));
  }
  return tickets;
};

module.exports = { generateTicketNumber, generateBulkTicketNumbers };
