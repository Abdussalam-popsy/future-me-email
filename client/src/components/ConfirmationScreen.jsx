import SendAnimation from './SendAnimation';

function ConfirmationScreen({ deliveryDate, onWriteAnother }) {
  return (
    <SendAnimation
      deliveryDate={deliveryDate}
      onWriteAnother={onWriteAnother}
    />
  );
}

export default ConfirmationScreen;
