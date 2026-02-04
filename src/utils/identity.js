import { v4 as uuidv4 } from 'uuid';

const GUEST_ID_KEY = 'guest_id';

/**
 * 게스트 ID를 가져오거나 새로 생성합니다.
 * LocalStorage에 저장하여 유지합니다.
 * @returns {string} Guest ID
 */
export function getOrInitGuestId() {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        guestId = uuidv4();
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
}
