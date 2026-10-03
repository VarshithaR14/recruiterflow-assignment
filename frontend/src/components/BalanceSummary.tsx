import { useMemo } from 'react';

import { useAppSelector } from '../store/hooks';
import { calculateBalances } from '../utils/balances';
import { formatMoney } from '../utils/money';

function BalanceSummary() {
  const members = useAppSelector((state) => state.members);
  const expenses = useAppSelector((state) => state.expenses);

  const balances = useMemo(
    () => calculateBalances(members, expenses),
    [members, expenses],
  );

  return (
    <section aria-labelledby="balance-heading">
      <h2 id="balance-heading">Balances</h2>

      <div className="balance-grid">
        {members.map((member) => {
          const balance = balances[member.id] ?? 0;

          return (
            <article key={member.id} className="balance-card">
              <h3>{member.name}</h3>

              <p>
                {balance >= 0 ? 'Gets back' : 'Owes'}
              </p>

              <strong>
                {formatMoney(Math.abs(balance))}
              </strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default BalanceSummary;