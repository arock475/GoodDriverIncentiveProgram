import React, { useEffect, useState } from "react";
import RuleListTable, { Rule } from "../../components/Shop/RuleListTable";
import { getUserClaims } from "../../utils/getUserClaims";

const ShopManage: React.FC = () => {
  const [userClaims, setUserClaims] = useState(getUserClaims());
  const [orgId, setOrgId] = useState(0);

  const [rules, setRules] = useState<Rule[]>([]);

  const handleSaveRules = async (updatedRules: Rule[]) => {
    if (userClaims.role != 0 && orgId != 0) {
      setRules(updatedRules);
      const rulesJson = JSON.stringify(updatedRules);
      try {
        const response = await fetch(`http://localhost:3333/orgs/${orgId}/rules`, {
          method: "POST",
          body: rulesJson,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to save rules.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (userClaims.role != 0) {
      fetch(`http://localhost:3333/sponsors/u:${userClaims.id}`)
        .then((res) => res.json())
        .then((data) => {
          setOrgId(data.OrganizationID);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }

    const fetchRules = async () => {
      try {
        const response = await fetch(`http://localhost:3333/orgs/${orgId}/rules`);

        if (!response.ok) {
          throw new Error("Failed to fetch rules.");
        }

        const rulesJson = await response.json();
        const parsedRules: Rule[] = JSON.parse(rulesJson);

        setRules(parsedRules);
      } catch (error) {
        console.error(error);
      }
    };

    if (orgId != 0) {
      fetchRules();
    }
  }, [orgId]);

  return (
    <div>
      <RuleListTable rules={rules} onSave={handleSaveRules} />
    </div>
  );
};

export default ShopManage;
