import LoginPage from '../../login/page';
import { Modal } from '../../_modal';

export const runtime = 'edge'

export default function LoginModal() {
  return (
    <>
      <span>login modal opened</span>
      <Modal path="/login">
        <LoginPage />
      </Modal>
    </>
  );
}
