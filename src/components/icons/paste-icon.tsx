export default function PasteIcon ({ isPasted }: { isPasted: boolean }): JSX.Element {
  return (
    <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 26" width="30" height="31">
      <path id="Layer" fillRule="evenodd" style={{ fill: 'none', stroke: '#000000', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '1.5' }} d="m15 8c0-1.1-0.9-2-2-2-1.1 0-2 0.9-2 2z"/>
      <path id="Layer" fillRule="evenodd" style={{ fill: '#000000' }} d="m14.3 8c-0.1-0.4 0.3-0.8 0.7-0.8h1.7c1.3 0 2.5 1.1 2.5 2.5q0 0 0 0v8.6q0.1 0 0 0c0 1.4-1.2 2.5-2.5 2.5h-7.4c-1.3 0-2.5-1.1-2.5-2.5q-0.1 0-0.1 0v-8.6q0 0 0.1 0c0-1.4 1.2-2.5 2.5-2.5h1.7c0.4 0 0.7 0.4 0.7 0.8 0 0.4-0.3 0.7-0.7 0.7h-1.7q0 0 0 0c-0.6 0-1 0.5-1.1 1l0.1 8.6c0 0.5 0.4 1 1 1v0.7-0.7q0 0 0 0v0.7-0.7h7.4q0 0 0 0v0.7-0.7c0.6 0 1-0.5 1-1l0.1-8.6c-0.1-0.5-0.5-1-1.1-1h-1.7c-0.4 0-0.8-0.3-0.8-0.7z"/>
      {
        isPasted &&
        <path id="Layer copy" fillRule="evenodd" style={{ fill: '#000000' }} d="m9.5 13.5c0.3-0.3 0.7-0.3 1 0l1.5 1.4 3.5-3.4c0.3-0.3 0.7-0.3 1 0 0.3 0.3 0.3 0.7 0 1l-4 4-0.5-0.5-0.5 0.5-2-2c-0.3-0.3-0.3-0.7 0-1zm3 3c-0.3 0.3-0.7 0.3-1 0l0.5-0.5zm6.7-6.8q0 0 0 0h-0.7zm0 8.6q0 0 0 0h-0.8zm-12.5 0q0 0 0 0h0.8zm0-8.6q0 0 0 0h0.7zm10-1q-0.1 0-0.1 0v-0.7zm0 10.5q0 0 0 0v0.7zm-7.3 0q0 0 0 0v0.8zm0-10.5q0 0 0 0v-0.8z"/>
      }
    </svg>
  )
}
